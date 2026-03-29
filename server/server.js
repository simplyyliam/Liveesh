import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 5174

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const dataFile = path.join(dataDir, 'wallpapers.json')

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (corsOrigins.includes(origin)) return true
  if (origin.startsWith('http://localhost:')) return true
  if (origin.startsWith('http://127.0.0.1:')) return true
  if (origin.startsWith('https://localhost:')) return true
  if (origin.startsWith('https://127.0.0.1:')) return true
  return false
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
  }),
)

app.use(express.json({ limit: '1mb' }))

const ensureStore = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ items: {} }, null, 2))
  }
}

const readStore = () => {
  ensureStore()
  const raw = fs.readFileSync(dataFile, 'utf-8')
  return JSON.parse(raw)
}

const writeStore = (store) => {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2))
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/wallpapers', (req, res) => {
  const settings = req.body?.settings
  if (!settings) {
    res.status(400).json({ error: 'Missing settings' })
    return
  }

  const store = readStore()
  const id = crypto.randomUUID()

  store.items[id] = {
    id,
    settings,
    createdAt: new Date().toISOString(),
  }

  writeStore(store)
  res.json({ id })
})

app.get('/api/wallpapers/:id', (req, res) => {
  const store = readStore()
  const record = store.items?.[req.params.id]

  if (!record) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  res.json(record)
})

const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`Wallpaper API running on ${port}`)
})

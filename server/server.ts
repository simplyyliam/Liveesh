import type { WallpaperStore, WallpaperSettings } from './../src/shared/types/wallpaper'
import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const port = Number(process.env.PORT)
if(!port) throw new Error('PORT environment variable is required by Render')

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Data store setup
const dataDir = path.join(__dirname, 'data')
const dataFile = path.join(dataDir, 'wallpapers.json')

const ensureStore = () => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify({ items: {} }, null, 2))
}

const readStore = (): WallpaperStore => {
  ensureStore()
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
  } catch (err) {
    console.log(err)
    return { items: {} }
  }
}

const writeStore = (store: WallpaperStore) => {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2))
}

// CORS setup
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) return true
  if (corsOrigins.includes(origin)) return true
  if (origin === 'http://tauri.localhost') return true
  if (origin === 'tauri://localhost') return true
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true
  return false
}

app.use(cors({ 
  origin: (origin, callback) => isAllowedOrigin(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS')) 
}))

app.use(express.json({ limit: '1mb' }))

// --- API Routes ---

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// Create wallpaper
app.post('/api/wallpapers', (req, res) => {
  const settings: WallpaperSettings = req.body?.settings
  if (!settings) return res.status(400).json({ error: 'Missing settings' })

  const store = readStore()
  const id = crypto.randomUUID()

  store.items[id] = { id, settings, createdAt: new Date().toISOString() }
  writeStore(store)

  res.json({ id })
})

// Get wallpaper by ID
app.get('/api/wallpapers/:id', (req, res) => {
  const store = readStore()
  const record = store.items?.[req.params.id]
  if (!record) return res.status(404).json({ error: 'Not found' })
  res.json(record)
})

// --- Start server ---
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Wallpaper API running on ${port}`)
})

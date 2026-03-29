import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

type BlobSpec = {
  id: number
  size: number
  x: number
  y: number
  hue: number
  alpha: number
  blur: number
  rotation: number
  radius: string
  driftX: number
  driftY: number
  driftScale: number
  driftRotate: number
  driftDuration: number
  driftDelay: number
}

type Palette = {
  name: string
  background: string
  anchors: string[]
}

type WallpaperSettings = {
  paletteIndex: number
  blobCount: number
  minSize: number
  maxSize: number
  softness: number
  opacity: number
  blurStrength: number
  noiseAmount: number
  grainScale: number
  seed: number
}

const palettes: Palette[] = [
  {
    name: 'Apricot Haze',
    background:
      'radial-gradient(120% 100% at 20% 20%, rgba(255, 255, 255, 0.75), rgba(255, 226, 196, 0.65) 45%, rgba(255, 206, 154, 0.65) 70%, rgba(255, 180, 130, 0.55) 100%)',
    anchors: ['#fff7ef', '#ffd9b3', '#f7b071', '#ee8d5c'],
  },
  {
    name: 'Soft Peach',
    background:
      'radial-gradient(120% 120% at 20% 20%, rgba(255, 255, 255, 0.9), rgba(254, 236, 210, 0.8) 45%, rgba(246, 196, 146, 0.7) 75%, rgba(244, 172, 134, 0.65) 100%)',
    anchors: ['#fff5e7', '#ffd8b8', '#f8b06d', '#e88a64'],
  },
  {
    name: 'Coastal Mist',
    background:
      'radial-gradient(120% 120% at 30% 10%, rgba(235, 245, 255, 0.95), rgba(206, 223, 239, 0.85) 45%, rgba(170, 197, 220, 0.7) 75%, rgba(134, 168, 202, 0.65) 100%)',
    anchors: ['#edf4ff', '#c2d6ef', '#98bbdf', '#6d90b8'],
  },
  {
    name: 'Blue Silk',
    background:
      'radial-gradient(120% 120% at 15% 15%, rgba(226, 240, 255, 0.95), rgba(187, 214, 255, 0.85) 45%, rgba(140, 176, 246, 0.75) 70%, rgba(106, 146, 226, 0.7) 100%)',
    anchors: ['#e6f1ff', '#b7d0ff', '#87b0f6', '#5d84d3'],
  },
  {
    name: 'Midnight Glow',
    background:
      'radial-gradient(120% 120% at 20% 20%, rgba(78, 94, 120, 0.65), rgba(38, 50, 71, 0.8) 45%, rgba(20, 25, 35, 0.95) 100%)',
    anchors: ['#c2d6ff', '#7f99cc', '#2b3a55', '#141a27'],
  },
]

const defaultSettings: WallpaperSettings = {
  paletteIndex: 0,
  blobCount: 11,
  minSize: 280,
  maxSize: 620,
  softness: 48,
  opacity: 0.55,
  blurStrength: 52,
  noiseAmount: 0.12,
  grainScale: 140,
  seed: 1,
}

const mulberry32 = (seed: number) => {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

const createBlobRadius = (rand: () => number) => {
  const a = 40 + rand() * 30
  const b = 40 + rand() * 30
  const c = 40 + rand() * 30
  const d = 40 + rand() * 30
  const e = 40 + rand() * 30
  const f = 40 + rand() * 30
  const g = 40 + rand() * 30
  const h = 40 + rand() * 30
  return `${a}% ${b}% ${c}% ${d}% / ${e}% ${f}% ${g}% ${h}%`
}

const hexToHue = (hex: string) => {
  const parsed = hex.replace('#', '')
  const bigint = parseInt(parsed, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min
  let hue = 0

  if (delta !== 0) {
    if (max === rNorm) {
      hue = ((gNorm - bNorm) / delta) % 6
    } else if (max === gNorm) {
      hue = (bNorm - rNorm) / delta + 2
    } else {
      hue = (rNorm - gNorm) / delta + 4
    }
    hue *= 60
    if (hue < 0) hue += 360
  }

  return hue
}

const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE
  if (envBase) return envBase.replace(/\/$/, '')

  if (import.meta.env.DEV) {
    return ''
  }

  const { protocol, hostname, port } = window.location
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`
}

function App() {
  const [settings, setSettings] = useState<WallpaperSettings>(defaultSettings)
  const [embedId] = useState(() => {
    const match = window.location.pathname.match(/\/embed\/([a-zA-Z0-9-]+)/)
    return match?.[1] ?? null
  })
  const [embedUrl, setEmbedUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const isEmbed = Boolean(embedId)
  const palette = palettes[settings.paletteIndex]
  const apiBase = useMemo(() => getApiBase(), [])

  const blobs = useMemo(() => {
    const rand = mulberry32(settings.seed)
    const anchors = palette.anchors.map(hexToHue)

    return Array.from({ length: settings.blobCount }, (_, index) => {
      const size = settings.minSize + rand() * (settings.maxSize - settings.minSize)
      const x = rand() * 100
      const y = rand() * 100
      const hue = anchors[Math.floor(rand() * anchors.length)]
      const alpha = settings.opacity * (0.5 + rand() * 0.6)
      const blur = settings.softness * (0.6 + rand() * 0.7)
      const rotation = rand() * 140 - 70
      const driftX = (rand() * 2 - 1) * 140
      const driftY = (rand() * 2 - 1) * 120
      const driftScale = rand() * 0.12
      const driftRotate = (rand() * 2 - 1) * 12
      const driftDuration = 18 + rand() * 28
      const driftDelay = -rand() * driftDuration

      return {
        id: index,
        size,
        x,
        y,
        hue,
        alpha,
        blur,
        rotation,
        radius: createBlobRadius(rand),
        driftX,
        driftY,
        driftScale,
        driftRotate,
        driftDuration,
        driftDelay,
      }
    })
  }, [settings, palette])

  useEffect(() => {
    if (!embedId) return
    let isMounted = true

    axios
      .get(`${apiBase}/api/wallpapers/${embedId}`)
      .then((response) => {
        if (!isMounted) return
        setSettings(response.data.settings)
      })
      .catch(() => {
        if (!isMounted) return
        setStatusMessage('Unable to load this wallpaper.')
      })

    return () => {
      isMounted = false
    }
  }, [apiBase, embedId])

  const updateSettings = (patch: Partial<WallpaperSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  const handleCompile = async () => {
    setIsSaving(true)
    setStatusMessage('')

    try {
      const response = await axios.post(`${apiBase}/api/wallpapers`, {
        settings,
      })
      const id = response.data.id
      const link = `${window.location.origin}/embed/${id}`
      setEmbedUrl(link)
      setStatusMessage('Saved. Your embed link is ready.')
    } catch (error) {
      setStatusMessage('Could not save this wallpaper. Try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className={`composer${isEmbed ? ' embed' : ''}`}>
      <section
        className="canvas"
        style={{
          backgroundImage: palette.background,
          ['--blur-strength' as string]: `${settings.blurStrength}px`,
          ['--noise-opacity' as string]: settings.noiseAmount.toString(),
          ['--grain-scale' as string]: `${settings.grainScale}px`,
        }}
      >
        <div className="mesh" aria-hidden="true">
          {blobs.map((blob) => (
            <div
              key={blob.id}
              className="blob"
              style={{
                width: `${blob.size}px`,
                height: `${blob.size}px`,
                top: `${blob.y}%`,
                left: `${blob.x}%`,
                borderRadius: blob.radius,
                opacity: blob.alpha,
                filter: `blur(${blob.blur}px)`,
                ['--base-rotate' as string]: `${blob.rotation}deg`,
                ['--float-x' as string]: `${blob.driftX}px`,
                ['--float-y' as string]: `${blob.driftY}px`,
                ['--float-scale' as string]: `${blob.driftScale}`,
                ['--float-rotate' as string]: `${blob.driftRotate}deg`,
                ['--float-duration' as string]: `${blob.driftDuration}s`,
                ['--float-delay' as string]: `${blob.driftDelay}s`,
                background: `radial-gradient(70% 70% at 30% 30%, hsla(${blob.hue}, 70%, 70%, 0.95), hsla(${blob.hue}, 55%, 55%, 0.08) 68%)`,
              }}
            />
          ))}
        </div>
        <div className="blur-layer" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        {isEmbed && statusMessage && (
          <div className="embed-status">{statusMessage}</div>
        )}
      </section>

      {!isEmbed && (
        <aside className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Mesh Composer</p>
              <h1>Wallpaper Blend Lab</h1>
              <p className="subtitle">
                Tune the atmosphere, softness, and grain to match the aesthetic
                mesh wallpapers you shared.
              </p>
            </div>
            <button
              className="ghost"
              type="button"
              onClick={() => updateSettings({ seed: settings.seed + 1 })}
            >
              Randomize
            </button>
          </div>

          <div className="control">
            <label htmlFor="palette">Palette</label>
            <div className="palette-row">
              <select
                id="palette"
                value={settings.paletteIndex}
                onChange={(event) =>
                  updateSettings({ paletteIndex: Number(event.target.value) })
                }
              >
                {palettes.map((item, index) => (
                  <option key={item.name} value={index}>
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="swatches" aria-hidden="true">
                {palette.anchors.map((color) => (
                  <span key={color} style={{ background: color }} />
                ))}
              </div>
            </div>
          </div>

          <div className="control">
            <label htmlFor="blobCount">Blob count</label>
            <input
              id="blobCount"
              type="range"
              min={6}
              max={18}
              value={settings.blobCount}
              onChange={(event) =>
                updateSettings({ blobCount: Number(event.target.value) })
              }
            />
            <p className="value">{settings.blobCount} blobs</p>
          </div>

          <div className="control">
            <label>Blob size</label>
            <div className="range-pair">
              <div>
                <span>Min</span>
                <input
                  type="range"
                  min={120}
                  max={480}
                  value={settings.minSize}
                  onChange={(event) =>
                    updateSettings({ minSize: Number(event.target.value) })
                  }
                />
              </div>
              <div>
                <span>Max</span>
                <input
                  type="range"
                  min={380}
                  max={900}
                  value={settings.maxSize}
                  onChange={(event) =>
                    updateSettings({ maxSize: Number(event.target.value) })
                  }
                />
              </div>
            </div>
            <p className="value">
              {Math.round(settings.minSize)}px to {Math.round(settings.maxSize)}px
            </p>
          </div>

          <div className="control">
            <label htmlFor="softness">Blob softness</label>
            <input
              id="softness"
              type="range"
              min={12}
              max={120}
              value={settings.softness}
              onChange={(event) =>
                updateSettings({ softness: Number(event.target.value) })
              }
            />
            <p className="value">{settings.softness}px blur</p>
          </div>

          <div className="control">
            <label htmlFor="opacity">Blob opacity</label>
            <input
              id="opacity"
              type="range"
              min={0.15}
              max={0.9}
              step={0.01}
              value={settings.opacity}
              onChange={(event) =>
                updateSettings({ opacity: Number(event.target.value) })
              }
            />
            <p className="value">{settings.opacity.toFixed(2)}</p>
          </div>

          <div className="control">
            <label htmlFor="blurStrength">Overall blur</label>
            <input
              id="blurStrength"
              type="range"
              min={0}
              max={120}
              value={settings.blurStrength}
              onChange={(event) =>
                updateSettings({ blurStrength: Number(event.target.value) })
              }
            />
            <p className="value">{settings.blurStrength}px</p>
          </div>

          <div className="control">
            <label htmlFor="noise">Noise amount</label>
            <input
              id="noise"
              type="range"
              min={0}
              max={0.4}
              step={0.01}
              value={settings.noiseAmount}
              onChange={(event) =>
                updateSettings({ noiseAmount: Number(event.target.value) })
              }
            />
            <p className="value">{settings.noiseAmount.toFixed(2)}</p>
          </div>

          <div className="control">
            <label htmlFor="grain">Grain scale</label>
            <input
              id="grain"
              type="range"
              min={120}
              max={320}
              value={settings.grainScale}
              onChange={(event) =>
                updateSettings({ grainScale: Number(event.target.value) })
              }
            />
            <p className="value">{settings.grainScale}px</p>
          </div>

          <div className="compile">
            <button
              className="compile-btn"
              type="button"
              onClick={handleCompile}
              disabled={isSaving}
            >
              {isSaving ? 'Compiling…' : 'Compile Wallpaper'}
            </button>
            {statusMessage && <p className="status">{statusMessage}</p>}
            {embedUrl && (
              <div className="embed-link">
                <p className="label">Embed link</p>
                <code>{embedUrl}</code>
              </div>
            )}
          </div>
        </aside>
      )}
    </main>
  )
}

export default App

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Background from './components/background'
import { palettes } from './lib/palettes'
import { defaultSettings, type WallpaperSettings } from './types/fluidMesh'
import './App.css'

const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE as string | undefined
  if (envBase) return envBase.replace(/\/$/, '')

  if (import.meta.env.DEV) {
    return ''
  }

  const { protocol, hostname, port } = window.location
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`
}

export default function App() {
  const [settings, setSettings] = useState<WallpaperSettings>(defaultSettings)
  const [embedId] = useState(() => {
    const match = window.location.pathname.match(/\/embed\/([a-zA-Z0-9-]+)/)
    return match?.[1] ?? null
  })
  const [embedUrl, setEmbedUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [fps, setFps] = useState(0)

  const isEmbed = Boolean(embedId)
  const palette = palettes[settings.paletteIndex]
  const apiBase = useMemo(() => getApiBase(), [])

  useEffect(() => {
    let frameId = 0
    let lastTime = performance.now()
    let lastReport = lastTime
    let frames = 0

    const loop = (time: number) => {
      frames += 1
      const elapsed = time - lastReport
      if (elapsed >= 500) {
        const fpsValue = (frames / elapsed) * 1000
        setFps(Math.round(fpsValue))
        frames = 0
        lastReport = time
      }
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [])

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
        <Background settings={settings} palette={palette} />
        <div className="blur-layer" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="fps">{fps} fps</div>
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
            <label htmlFor="softness">Wave softness</label>
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
            <p className="value">{settings.softness}px</p>
          </div>

          <div className="control">
            <label htmlFor="opacity">Wave opacity</label>
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

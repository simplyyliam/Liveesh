import { useMemo, useState } from 'react'
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

function App() {
  const [paletteIndex, setPaletteIndex] = useState(0)
  const [blobCount, setBlobCount] = useState(11)
  const [minSize, setMinSize] = useState(280)
  const [maxSize, setMaxSize] = useState(620)
  const [softness, setSoftness] = useState(48)
  const [opacity, setOpacity] = useState(0.55)
  const [blurStrength, setBlurStrength] = useState(52)
  const [noiseAmount, setNoiseAmount] = useState(0.12)
  const [grainScale, setGrainScale] = useState(140)
  const [seed, setSeed] = useState(1)

  const palette = palettes[paletteIndex]

  const blobs = useMemo(() => {
    const rand = mulberry32(seed)
    const anchors = palette.anchors.map(hexToHue)

    return Array.from({ length: blobCount }, (_, index) => {
      const size = minSize + rand() * (maxSize - minSize)
      const x = rand() * 100
      const y = rand() * 100
      const hue = anchors[Math.floor(rand() * anchors.length)]
      const alpha = opacity * (0.5 + rand() * 0.6)
      const blur = softness * (0.6 + rand() * 0.7)
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
  }, [blobCount, minSize, maxSize, softness, opacity, palette, seed])

  return (
    <main className="composer">
      <section
        className="canvas"
        style={{
          backgroundImage: palette.background,
          ['--blur-strength' as string]: `${blurStrength}px`,
          ['--noise-opacity' as string]: noiseAmount.toString(),
          ['--grain-scale' as string]: `${grainScale}px`,
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
      </section>

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
            onClick={() => setSeed((prev) => prev + 1)}
          >
            Randomize
          </button>
        </div>

        <div className="control">
          <label htmlFor="palette">Palette</label>
          <div className="palette-row">
            <select
              id="palette"
              value={paletteIndex}
              onChange={(event) => setPaletteIndex(Number(event.target.value))}
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
            value={blobCount}
            onChange={(event) => setBlobCount(Number(event.target.value))}
          />
          <p className="value">{blobCount} blobs</p>
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
                value={minSize}
                onChange={(event) => setMinSize(Number(event.target.value))}
              />
            </div>
            <div>
              <span>Max</span>
              <input
                type="range"
                min={380}
                max={900}
                value={maxSize}
                onChange={(event) => setMaxSize(Number(event.target.value))}
              />
            </div>
          </div>
          <p className="value">
            {Math.round(minSize)}px to {Math.round(maxSize)}px
          </p>
        </div>

        <div className="control">
          <label htmlFor="softness">Blob softness</label>
          <input
            id="softness"
            type="range"
            min={12}
            max={120}
            value={softness}
            onChange={(event) => setSoftness(Number(event.target.value))}
          />
          <p className="value">{softness}px blur</p>
        </div>

        <div className="control">
          <label htmlFor="opacity">Blob opacity</label>
          <input
            id="opacity"
            type="range"
            min={0.15}
            max={0.9}
            step={0.01}
            value={opacity}
            onChange={(event) => setOpacity(Number(event.target.value))}
          />
          <p className="value">{opacity.toFixed(2)}</p>
        </div>

        <div className="control">
          <label htmlFor="blurStrength">Overall blur</label>
          <input
            id="blurStrength"
            type="range"
            min={0}
            max={120}
            value={blurStrength}
            onChange={(event) => setBlurStrength(Number(event.target.value))}
          />
          <p className="value">{blurStrength}px</p>
        </div>

        <div className="control">
          <label htmlFor="noise">Noise amount</label>
          <input
            id="noise"
            type="range"
            min={0}
            max={0.4}
            step={0.01}
            value={noiseAmount}
            onChange={(event) => setNoiseAmount(Number(event.target.value))}
          />
          <p className="value">{noiseAmount.toFixed(2)}</p>
        </div>

        <div className="control">
          <label htmlFor="grain">Grain scale</label>
          <input
            id="grain"
            type="range"
            min={120}
            max={320}
            value={grainScale}
            onChange={(event) => setGrainScale(Number(event.target.value))}
          />
          <p className="value">{grainScale}px</p>
        </div>
      </aside>
    </main>
  )
}

export default App

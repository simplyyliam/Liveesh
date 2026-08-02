export type WallpaperColors = [string, string, string, string]

export interface Palette {
  name: string
  background: string
  anchors: string[]
}

export type WallpaperPattern = "fluid" | "topographic"

export type WallpaperSettings = {
  pattern: WallpaperPattern
  colors: WallpaperColors;
  paletteIndex: number
  blobCount: number
  minSize: number
  maxSize: number
  softness: number
  opacity: number
  blurStrength: number
  noiseAmount: number
  grainScale: number
  grainOpacity: number
  animationSpeed: number
  renderScale: number
  fbmOctaves: number
  adaptiveMode: boolean
  seed: number
}

export const defaultSettings: WallpaperSettings = {
  pattern: "fluid",
  colors: ["#e8f6ff", "#b2ddf5", "#5fb3e6", "#1a6fd1"],
  paletteIndex: 2,
  blobCount: 11,
  minSize: 280,
  maxSize: 620,
  softness: 48,
  opacity: 1,
  blurStrength: 52,
  noiseAmount: 0.12,
  grainScale: 140,
  grainOpacity: 1,
  animationSpeed: 1,
  renderScale: 1,
  fbmOctaves: 4,
  adaptiveMode: false,
  seed: 1,
}

export const hexToHue = (hex: string) => {
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


export type WallpaperStore = {
  items: Record<
    string,
    {
      id: string
      settings: WallpaperSettings
      createdAt: string
    }
  >
}

import { useEffect, useRef } from 'react'
import { FluidGradient } from '../utils/FluidGradient'
import type { Palette, WallpaperSettings } from '../types/fluidMesh'


type BackgroundProps = {
  settings: WallpaperSettings
  palette: Palette
}

export default function Background({ settings, palette }: BackgroundProps) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<FluidGradient | null>(null)
  const settingsRef = useRef(settings)
  const paletteRef = useRef(palette)

  useEffect(() => {
    settingsRef.current = settings
    paletteRef.current = palette
    engineRef.current?.update(settings, palette)
  }, [settings, palette])

  useEffect(() => {
    if (!ref.current) return

    engineRef.current = new FluidGradient(ref.current, settingsRef.current, paletteRef.current)

    return () => {
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [])

  return <canvas ref={ref} className="mesh-canvas" />
}

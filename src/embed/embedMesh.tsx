import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FluidGradient } from "../utils/FluidGradient";
import { palettes } from "../lib/palettes";
import type { WallpaperSettings } from "../types/fluidMesh";

export default function Embed() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [settings, setSettings] = useState<WallpaperSettings>();
  const embedId = window.location.pathname.split("/embed/")[1];

  useEffect(() => {
    if (!embedId) return;

    axios
      .get(`/api/wallpapers/${embedId}`)
      .then((res) => setSettings(res.data.settings))
      .catch(() => console.error("Failed to load wallpaper"));
  }, [embedId]);

  useEffect(() => {
    if (!canvasRef.current || !settings) return;


  const palette = palettes[settings.paletteIndex];
  const engine = new FluidGradient(canvasRef.current, settings, palette);

    return () => engine.destroy();
  }, [settings]);

  return (
  <canvas
    ref={canvasRef}
    width={window.innerWidth}
    height={window.innerHeight}
    style={{ display: "block" }}
  />
);
}
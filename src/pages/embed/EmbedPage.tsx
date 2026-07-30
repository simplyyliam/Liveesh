import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FluidGradient } from "../../lib/fluid-gradient";
import { palettes } from "../../lib/palettes";
import type { WallpaperSettings } from "../../shared/types/wallpaper";

export default function EmbedPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [settings, setSettings] = useState<WallpaperSettings>();
  const embedId = window.location.pathname.split("/embed/")[1];

  useEffect(() => {
    if (!embedId) return;

    axios
      .get(`/api/wallpapers/${embedId}`)
      .then((response) => setSettings(response.data.settings))
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

import { useEffect, useRef } from "react";
import { FluidGradient } from "../../lib/fluid-gradient";
import type {
  Palette,
  WallpaperSettings,
} from "../../shared/types/wallpaper";

type WallpaperCanvasProps = {
  settings: WallpaperSettings;
  palette: Palette;
  fullscreen?: boolean;
};

export default function WallpaperCanvas({
  settings,
  palette,
  fullscreen = false,
}: WallpaperCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FluidGradient | null>(null);
  const settingsRef = useRef(settings);
  const paletteRef = useRef(palette);

  useEffect(() => {
    settingsRef.current = settings;
    paletteRef.current = palette;
    engineRef.current?.update(settings, palette);
  }, [settings, palette]);

  useEffect(() => {
    engineRef.current?.resize();
  }, [settings.renderScale]);

  useEffect(() => {
    if (!ref.current) return;

    engineRef.current = new FluidGradient(
      ref.current,
      settingsRef.current,
      paletteRef.current,
    );

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={
        fullscreen
          ? "block h-full w-full bg-black"
          : "block h-full w-full rounded-[6.5px] bg-black"
      }
    />
  );
}

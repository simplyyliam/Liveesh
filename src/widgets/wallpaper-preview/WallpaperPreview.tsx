import { useMemo } from "react";
import { NoiseOverlay, WallpaperCanvas } from "../../features/preview";
import { palettes } from "../../lib/palettes";
import type { WallpaperSettings } from "../../shared/types/wallpaper";

interface WallpaperPreviewProps {
  settings: WallpaperSettings;
  adaptiveScale: number;
  adaptiveOctaves: number;
}

export default function WallpaperPreview({
  settings,
  adaptiveScale,
  adaptiveOctaves,
}: WallpaperPreviewProps) {
  const palette = useMemo(() => {
    const preset = palettes[settings.paletteIndex];

    return {
      ...preset,
      anchors: settings.colors,
    };
  }, [settings.colors, settings.paletteIndex]);
  const canvasSettings = useMemo(
    () => ({
      ...settings,
      renderScale: settings.adaptiveMode
        ? adaptiveScale
        : settings.renderScale,
      fbmOctaves: settings.adaptiveMode
        ? adaptiveOctaves
        : settings.fbmOctaves,
    }),
    [adaptiveOctaves, adaptiveScale, settings],
  );

  return (
    <div className="relative h-full w-full rounded-[6.5px] bg-neutral-500">
      <NoiseOverlay opacity={settings.grainOpacity} rounded={6.5} />
      <WallpaperCanvas settings={canvasSettings} palette={palette} />
    </div>
  );
}

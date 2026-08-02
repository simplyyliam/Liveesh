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
  const preset = palettes[settings.paletteIndex]
  const palette = {
    ...preset,
    anchors: settings.colors
  }

  return (
    <div className="relative h-full w-full rounded-[6.5px] bg-neutral-500">
      <NoiseOverlay opacity={settings.grainOpacity} rounded={6.5} />
      <WallpaperCanvas
        settings={{
          ...settings,
          renderScale: settings.adaptiveMode
            ? adaptiveScale
            : settings.renderScale,
          fbmOctaves: settings.adaptiveMode
            ? adaptiveOctaves
            : settings.fbmOctaves,
        }}
        palette={palette}
      />
    </div>
  );
}

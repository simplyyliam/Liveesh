import { palettes } from "../../lib/palettes";
import type { WallpaperSettings } from "../../types/fluidMesh";
import Background from "../background";
import { Noise } from "./noise";

interface PreviewProps {
    settings: WallpaperSettings
    adaptiveScale: number
    adaptiveOctaves: number
}

export default function Preview({settings, adaptiveScale, adaptiveOctaves}: PreviewProps) {
      const palette = palettes[settings.paletteIndex];
    
  return (
    <div className="relative w-full h-full rounded-3xl bg-neutral-500">
      <Noise opacity={1} rounded={24}/>
      <Background
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

import { useState } from "react";
import { generateChainedPalette } from "@/lib/chained-palette";
import type { WallpaperColors } from "@/shared/types/wallpaper";
import { Wheel, hexToHsva, type HsvaColor } from "@uiw/react-color";

type ColorControlProps = {
  colors: WallpaperColors;
  onColorsChange: (colors: WallpaperColors) => void;
};

export function ColorControls({ colors, onColorsChange }: ColorControlProps) {
  const [wheelColor, setWheelColor] = useState<HsvaColor>(() =>
    hexToHsva(colors[2]),
  );

  function updateSwatch(index: number, color: string) {
    const nextColors = [...colors] as WallpaperColors;
    nextColors[index] = color;
    setWheelColor(hexToHsva(color));
    onColorsChange(nextColors);
  }

  function updateChainedPalette(color: HsvaColor) {
    setWheelColor(color);
    onColorsChange(generateChainedPalette(color));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color, index) => (
          <label
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
            key={index}
            style={{ backgroundColor: color }}
          >
            <span className="sr-only">Color {index + 1}</span>
            <input
              aria-label={`Color ${index + 1}`}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              onInput={(event) =>
                updateSwatch(index, event.currentTarget.value)
              }
              type="color"
              value={color}
            />
          </label>
        ))}
      </div>

      <div className="flex w-full justify-center rounded-lg bg-muted/45 p-3">
        <Wheel
          aria-label="Linked palette color wheel"
          color={wheelColor}
          height={220}
          onChange={({ hsva }) => updateChainedPalette(hsva)}
          width={220}
        />
      </div>
    </div>
  );
}

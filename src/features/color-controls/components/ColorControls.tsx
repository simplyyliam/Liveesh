import type { WallpaperColors } from "@/shared/types";

type ColorControlProps = {
  colors: WallpaperColors;
  onColorChange: (index: number, color: string) => void
}

export function ColorControls({ colors, onColorChange }: ColorControlProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map((color, index) => (
        <label
          key={index}
          style={{ backgroundColor: color }}
          className="relative aspect-square cursor-pointer overflow-hidden rounded-lg" >
          <span className="sr-only">Color {index + 1}</span>
          <input
            aria-label={`Color ${index + 1}`}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            onInput={(event) =>
              onColorChange(index, event.currentTarget.value)
            }
            type="color"
            value={color}
          />
        </label>
      ))}
    </div>
  )
}

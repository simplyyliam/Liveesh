const generatePixelGrain = () => {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = 1000;
  canvas.width = size;
  canvas.height = size;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grain = Math.random() < 0.5 ? 35 : 0;
    const brightness = 65 + grain;
    data[i] = data[i + 1] = data[i + 2] = brightness;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

const PIXEL_GRAIN_URL = generatePixelGrain();

type NoiseOverlayProps = {
  opacity?: number;
  rounded?: number;
};

export function NoiseOverlay({
  opacity = 0.1,
  rounded = 40,
}: NoiseOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none drop-shadow-[5px_4px_9.7px_rgba(0,0,0,0.25)]"
      style={{
        opacity,
        borderRadius: rounded,
        backgroundImage: `url(${PIXEL_GRAIN_URL})`,
        backgroundSize: "128px 128px",
        backgroundRepeat: "repeat",
        imageRendering: "crisp-edges",
        mixBlendMode: "overlay",
      }}
    />
  );
}

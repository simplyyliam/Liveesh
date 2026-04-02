const generatePixelGrain = () => {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return ;


  const size = 1000; // grain amount 
  canvas.width = size;
  canvas.height = size;

  const idata = ctx.createImageData(size, size);
  const data = idata.data;
  console.log("Data", data)

  for (let i = 0; i < data.length; i += 4) {
    const grain = Math.random() < 0.5 ? 35 : 0; 
    const brightness = 65 + grain; 
    data[i] = data[i + 1] = data[i + 2] = brightness;
    data[i + 3] = 255; 
  }

  ctx.putImageData(idata, 0, 0);
  return canvas.toDataURL();
};

const PIXEL_GRAIN_URL = generatePixelGrain();

export const Noise = ({ opacity = 0.1, rounded = 40}) => (
  <div
    className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 drop-shadow-[5px_4px_9.7px_rgba(0,0,0,0.25)]"
    style={{
      opacity,
      borderRadius: rounded,
      backgroundImage: `url(${PIXEL_GRAIN_URL})`,
      backgroundSize: "128px 128px", // Scale this up or down to change the "pixel" size
      backgroundRepeat: "repeat",
      /* THIS IS KEY: It stops the browser from blurring the pixels */
      // imageRendering: "pixelated", 
      imageRendering: "crisp-edges",
      mixBlendMode: "overlay",
    }}
  />
);

import { useEffect, useRef } from "react";
import { FluidGradient } from "../utils/FluidGradient";

export default function Background() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const engine = new FluidGradient(ref.current);
    return () => engine.destroy();
  }, []);

  return (
    <>
      <canvas ref={ref} />
    </>
  );
}
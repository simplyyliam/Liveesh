import { useLayoutEffect, useRef, useState } from "react";
import { Noise } from "../../canvas";

type SliderProps = {
  value?: number
  onChange: (value: number) => void
}

export default function Slider({ value, onChange }: SliderProps) {
  const [posY, setPosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLButtonElement>(null);
  const dragOffset = useRef(0);

  // Initialize thumb position based on current value **before paint**
  useLayoutEffect(() => {
    const slider = sliderRef.current;
    const thumb = thumbRef.current;
    if (!slider || !thumb) return;

    const thumbHeight = thumb.offsetHeight;
    const sliderHeight = slider.offsetHeight;
    const maxY = sliderHeight - thumbHeight;
    if (maxY <= 0) return;

    const clamped = Math.max(0, Math.min(100, value ?? 0));
    const y = (1 - clamped / 100) * maxY;
    setPosY(y);
  }, [value]);

  useLayoutEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const rect = slider.getBoundingClientRect();
      const thumbHeight = thumbRef.current?.offsetHeight ?? 0;
      const maxY = rect.height - thumbHeight;

      let y = e.clientY - rect.top - dragOffset.current;
      y = Math.max(0, Math.min(y, maxY));

      const normalized = Math.round((1 - y / maxY) * 100);
      onChange(normalized);
      setPosY(y);
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onChange]);

  return (
    <div
      ref={sliderRef}
      className="relative flex items-end justify-center w-4.75 h-full p-0.5 bg-black rounded-full"
    >
      {/* Slider progress */}
      <div
        className="relative w-4.75 h-full p-0.5 bg-[#312F2C] rounded-full"
        style={{ height: `${value}%` }}
      >
        <Noise opacity={0.9} />
      </div>
      {/* Thumb */}
      <button
        ref={thumbRef}
        onMouseDown={(e) => {
          const thumbRect = thumbRef.current?.getBoundingClientRect();
          if (!thumbRect) return;
          dragOffset.current = e.clientY - thumbRect.top;
          setIsDragging(true);
        }}
        className="absolute w-10 h-4 bg-[#3B3834] rounded-full  border-neutral-600 border-[0.5px]
        shadow-[0px_7px_15.6px_1px_rgba(40,40,40,0.69)] cursor-pointer"
        style={{
          top: 0,
          transform: `translate(0, ${posY}px)`,
        }}
      >
        <Noise opacity={1} />
      </button>
    </div>
  );
}

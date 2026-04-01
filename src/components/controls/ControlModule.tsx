import type { HTMLAttributes } from "react";
import { Noise } from "../canvas";

export const ControlModule: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  title,
  ...props
}) => {
  return (
    <div
      className={`flex bg-[#484745] min-w-106.75 w-full h-full rounded-[40px] ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center relative w-full h-full px-12.5 rounded-[40px]">
        <Noise opacity={1} />
        <div className="relative">{children}</div>
      </div>
      <div className="flex items-end px-3 py-6 w-fit h-full">
        <h1 className="rotate-270">{title}</h1>
      </div>
    </div>
  );
};

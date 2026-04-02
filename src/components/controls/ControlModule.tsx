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
      className={`flex bg-[#484745] h-full rounded-[40px]`}
      {...props}
    >
      <div className={`relative p-8 h-full rounded-[40px]`}>
        <Noise opacity={1} />

        <div className={`w-full h-full  ${className}`}>{children}</div>
      </div>
      <div className="flex items-end justify-center h-full w-12 pb-12 shrink-0">
        <h1 className="-rotate-90 text-white text-[16px] font-DOT leading-none">
          {title}
        </h1>
      </div>
    </div>
  );
};

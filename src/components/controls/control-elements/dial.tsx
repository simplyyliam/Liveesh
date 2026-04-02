import { Noise } from "../../canvas";

interface DialProps {
  title: string
  className?: string
}

export default function Dial({ title, className }: DialProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div
        className={`
                // Outer ring
                flex flex-col items-center justify-center
                w-35 h-35
                rounded-full box-border
                border-b-3 border-[#BFBFBF25]
                shadow-[0px_12px_37.8px_-9px_rgba(0,0,0,0.43)]
                ${className}
            `}
        style={{
          background: "linear-gradient(35deg, #BFBFBF60 1%, #01010100 30%)",
        }}
      >
        <div
          className={`
                    // Inner circle
                    flex flex-col items-center justify-center
                    w-full h-full p-0.5 gap-7.5
                    rounded-full overflow-hidden
                    bg-[linear-gradient(180deg,rgba(56,56,56,0.74)_0%,#000000_100%)]
                `}
        >
          <div
            className="flex items-center justify-center w-full h-full rounded-full"
            style={{
              padding: "2px",
              background:
                "linear-gradient(230deg, #BFBFBF50 0%, #01010100 40%)",
            }}
          >
            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#3e3b37] shadow-[0px_12px_8.7px_rgba(0,0,0,0.25),inset_0px_12px_56.1px_-18px_rgba(0,0,0,0.25)]">
              <Noise opacity={0.8} />
            </div>
          </div>
        </div>
      </div>
      <span className="text-[14px] text-white">{title}</span>
    </div>
  );
}

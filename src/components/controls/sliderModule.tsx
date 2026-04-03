import { useMesh } from "../../store/meshStore";
import { Slider } from "./control-elements";
import { ControlModule } from "./ControlModule";

export default function Sliders() {
  const softness = useMesh((s) => s.softness)
  const setSoftness = useMesh((s) => s.setSoftness)
  return (
    <ControlModule className="flex gap-10" title="Sliders">
      <div className="flex items-center justify-center w-15 h-full">
        <Slider value={softness} onChange={setSoftness} />
      </div>
      <span className="text-white">{softness}</span>
    </ControlModule>
  );
}

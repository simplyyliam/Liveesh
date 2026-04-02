import { Dial } from "./control-elements";
import { ControlModule } from "./ControlModule";

export default function DialModule() {
  return (
    <ControlModule title="MATERIAL">
      <div className="relative flex flex-col items-center justify-center h-full ">
        <Dial title="Blur"/>
        <div className="flex gap-4">
          <Dial className="w-29.5! h-29.5!" title="Softness"/>
          <Dial className="w-29.5! h-29.5!" title="Noise"/>
        </div>
      </div>
    </ControlModule>
  );
}

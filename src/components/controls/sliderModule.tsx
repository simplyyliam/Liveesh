import { Slider } from "./control-elements";
import { ControlModule } from "./ControlModule";


export default function Sliders() {
    return (
        <ControlModule className="flex gap-10" title="Sliders">
            <Slider/>
            <Slider/>
        </ControlModule>
    )
}
import { ChromaticControlModule, DialModule, SliderModule, TactileModule } from ".";


export default function ControllerContainer () {
    return (
        <div className="flex w-[75%] h-123 gap-2.5">
            <DialModule/>
            <SliderModule/>
            <TactileModule/>
            <ChromaticControlModule/>
        </div>
    )
}
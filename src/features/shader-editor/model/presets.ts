import type { ShaderControlSection } from "./types";

export const shaderControlSections: ShaderControlSection[] = [
  {
    id: "form",
    title: "Form",
    controls: [
      {
        key: "grainScale",
        label: "Scale",
        min: 120,
        max: 320,
        step: 0.5,
        unit: "px",
      },
      {
        key: "noiseAmount",
        label: "Warp",
        min: 0,
        max: 0.4,
        step: 0.01,
      },
      {
        key: "fbmOctaves",
        label: "Detail",
        min: 2,
        max: 4,
        step: 1,
      },
      {
        key: "softness",
        label: "Softness",
        min: 7,
        max: 63,
        step: 0.5,
      },
    ],
  },
  {
    id: "motion",
    title: "Motion",
    controls: [
      {
        key: "animationSpeed",
        label: "Speed",
        min: 0,
        max: 3,
        step: 0.05,
        unit: "×",
      },
    ],
  },
  {
    id: "material",
    title: "Material",
    controls: [
      {
        key: "opacity",
        label: "Intensity",
        min: 0.2,
        max: 1,
        step: 0.01,
      },
    ],
  },
];

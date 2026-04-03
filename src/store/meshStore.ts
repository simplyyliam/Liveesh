import { create } from "zustand"
import { defaultSettings } from "../types/fluidMesh"

type MeshStore = {
    // States
    softness: number
    opacity: number
    blurStrength: number
    noiseAmount: number
    grainScale: number
    renderScale: number
    // Actions
    setSoftness: (value: number) => void
    setOpacity: (value: number) => void
    setBlurStrength: (value: number) => void
    setNoiseAmount: (value: number) => void
    setGrainScale: (value: number) => void
    setRenderScale: (value: number) => void
}

export const useMesh = create<MeshStore>((set) => ({
    softness: defaultSettings.softness,
    opacity: defaultSettings.opacity,
    blurStrength: defaultSettings.blurStrength,
    noiseAmount: defaultSettings.noiseAmount,
    grainScale: defaultSettings.grainScale,
    renderScale: defaultSettings.renderScale,
    setSoftness: (value) => set({ softness: value }),
    setOpacity: (value) => set({ opacity: value }),
    setBlurStrength: (value) => set({ blurStrength: value }),
    setNoiseAmount: (value) => set({ noiseAmount: value }),
    setGrainScale: (value) => set({ grainScale: value }),
    setRenderScale: (value) => set({ renderScale: value }),

}))


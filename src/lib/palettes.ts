import type { Palette } from "../types/fluidMesh";

export const palettes: Palette[] = [
  {
    name: 'Radiant Ember',
    background:
      'radial-gradient(140% 140% at 20% 20%, rgba(255, 255, 255, 0.9), rgba(255, 235, 215, 0.85) 35%, rgba(255, 166, 118, 0.75) 65%, rgba(245, 86, 76, 0.7) 100%)',
    anchors: ['#fff6ef', '#ffd2b6', '#ff8f6b', '#f44b45'],
  },
  {
    name: 'Solar Tide',
    background:
      'radial-gradient(140% 140% at 25% 20%, rgba(255, 255, 255, 0.9), rgba(255, 246, 209, 0.85) 40%, rgba(255, 206, 120, 0.75) 70%, rgba(240, 156, 72, 0.7) 100%)',
    anchors: ['#fff6e6', '#ffe5a8', '#ffc267', '#f08b3c'],
  },
  {
    name: 'Blue Current',
    background:
      'radial-gradient(140% 140% at 20% 20%, rgba(236, 248, 255, 0.95), rgba(180, 225, 245, 0.85) 40%, rgba(90, 170, 230, 0.78) 70%, rgba(30, 110, 210, 0.72) 100%)',
    anchors: ['#e8f6ff', '#b2ddf5', '#5fb3e6', '#1a6fd1'],
  },
  {
    name: 'Indigo Flux',
    background:
      'radial-gradient(140% 140% at 25% 20%, rgba(238, 242, 255, 0.95), rgba(190, 204, 250, 0.86) 45%, rgba(116, 134, 220, 0.78) 75%, rgba(64, 76, 176, 0.72) 100%)',
    anchors: ['#ecf0ff', '#bec9f7', '#7386e0', '#404cb0'],
  },
  {
    name: 'Nocturne Glow',
    background:
      'radial-gradient(140% 140% at 20% 20%, rgba(100, 112, 142, 0.75), rgba(52, 66, 100, 0.9) 45%, rgba(24, 30, 48, 0.98) 100%)',
    anchors: ['#d0d8ff', '#8a99d8', '#3b4c7b', '#141b2d'],
  },
];

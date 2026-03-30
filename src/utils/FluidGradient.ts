import { type Palette, type WallpaperSettings } from '../types/fluidMesh'

type RGB = { r: number; g: number; b: number }

const vertexSource = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const fragmentSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_softness;
uniform float u_opacity;
uniform float u_noise;
uniform float u_scale;
uniform vec3 u_colA;
uniform vec3 u_colB;
uniform vec3 u_colC;
uniform vec3 u_colD;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.6;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.1;
    amplitude *= 0.5;
  }
  return value;
}

vec3 gradientMix(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  if (t < 0.33) {
    return mix(a, b, smoothstep(0.0, 0.33, t));
  }
  if (t < 0.66) {
    return mix(b, c, smoothstep(0.33, 0.66, t));
  }
  return mix(c, d, smoothstep(0.66, 1.0, t));
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.08;

  vec2 flow = vec2(
    fbm(uv * u_scale + vec2(t * 0.35, -t * 0.22)),
    fbm(uv * (u_scale * 0.95) + vec2(-t * 0.25, t * 0.3))
  );

  uv += (flow - 0.5) * (0.45 + 0.35 * u_noise);

  float field = fbm(uv * (u_scale * 1.2) + vec2(t * 0.2, t * -0.18));
  float softness = clamp(u_softness, 0.05, 0.45);
  float shaped = smoothstep(0.5 - softness, 0.5 + softness, field);

  vec3 color = gradientMix(shaped, u_colA, u_colB, u_colC, u_colD);

  float alpha = clamp(u_opacity, 0.2, 0.9);
  vec3 base = mix(u_colA, u_colB, 0.4);
  vec3 finalColor = mix(base, color, alpha);

  outColor = vec4(finalColor, 1.0);
}`

const hexToRgb = (hex: string): RGB => {
  const parsed = hex.replace('#', '')
  const bigint = parseInt(parsed, 16)
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  }
}

const pickColors = (palette: Palette) => {
  const anchors = palette.anchors
  const c0 = hexToRgb(anchors[0])
  const c1 = hexToRgb(anchors[Math.min(1, anchors.length - 1)])
  const c2 = hexToRgb(anchors[Math.min(2, anchors.length - 1)])
  const c3 = hexToRgb(anchors[Math.min(3, anchors.length - 1)])
  return [c0, c1, c2, c3]
}

export class FluidGradient {
  private canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext
  private program: WebGLProgram
  private vao: WebGLVertexArrayObject
  private width = 0
  private height = 0
  private dpr = 1
  private frameId = 0
  private settings: WallpaperSettings
  private palette: Palette
  private resizeObserver?: ResizeObserver
  private isPaused = false

  private uResolution: WebGLUniformLocation | null
  private uTime: WebGLUniformLocation | null
  private uSoftness: WebGLUniformLocation | null
  private uOpacity: WebGLUniformLocation | null
  private uNoise: WebGLUniformLocation | null
  private uScale: WebGLUniformLocation | null
  private uColA: WebGLUniformLocation | null
  private uColB: WebGLUniformLocation | null
  private uColC: WebGLUniformLocation | null
  private uColD: WebGLUniformLocation | null

  constructor(canvas: HTMLCanvasElement, settings: WallpaperSettings, palette: Palette) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false })
    if (!gl) {
      throw new Error('WebGL2 not supported')
    }
    this.gl = gl

    this.program = this.createProgram(vertexSource, fragmentSource)
    this.vao = this.createQuad()

    this.uResolution = gl.getUniformLocation(this.program, 'u_resolution')
    this.uTime = gl.getUniformLocation(this.program, 'u_time')
    this.uSoftness = gl.getUniformLocation(this.program, 'u_softness')
    this.uOpacity = gl.getUniformLocation(this.program, 'u_opacity')
    this.uNoise = gl.getUniformLocation(this.program, 'u_noise')
    this.uScale = gl.getUniformLocation(this.program, 'u_scale')
    this.uColA = gl.getUniformLocation(this.program, 'u_colA')
    this.uColB = gl.getUniformLocation(this.program, 'u_colB')
    this.uColC = gl.getUniformLocation(this.program, 'u_colC')
    this.uColD = gl.getUniformLocation(this.program, 'u_colD')

    this.settings = settings
    this.palette = palette

    this.resize()
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.resize)
      this.resizeObserver.observe(this.canvas)
    } else {
      window.addEventListener('resize', this.resize)
    }

    document.addEventListener('visibilitychange', this.handleVisibility)
    this.frameId = requestAnimationFrame(this.animate)
  }

  public update(settings: WallpaperSettings, palette: Palette) {
    this.settings = settings
    this.palette = palette
  }

  private createProgram(vertex: string, fragment: string) {
    const gl = this.gl

    const vs = gl.createShader(gl.VERTEX_SHADER)
    if (!vs) throw new Error('Failed to create vertex shader')
    gl.shaderSource(vs, vertex)
    gl.compileShader(vs)
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(vs) || 'Vertex shader compile failed')
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fs) throw new Error('Failed to create fragment shader')
    gl.shaderSource(fs, fragment)
    gl.compileShader(fs)
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(fs) || 'Fragment shader compile failed')
    }

    const program = gl.createProgram()
    if (!program) throw new Error('Failed to create program')
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Program link failed')
    }

    gl.deleteShader(vs)
    gl.deleteShader(fs)
    return program
  }

  private createQuad() {
    const gl = this.gl
    const vao = gl.createVertexArray()
    if (!vao) throw new Error('Failed to create VAO')
    gl.bindVertexArray(vao)

    const buffer = gl.createBuffer()
    if (!buffer) throw new Error('Failed to create buffer')
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    const verts = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

    const loc = gl.getAttribLocation(this.program, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    gl.bindVertexArray(null)
    return vao
  }

  private resize = () => {
    const rect = this.canvas.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height
    this.dpr = 1

    const scaledWidth = Math.max(1, Math.floor(this.width * this.dpr))
    const scaledHeight = Math.max(1, Math.floor(this.height * this.dpr))

    this.canvas.width = scaledWidth
    this.canvas.height = scaledHeight
    this.gl.viewport(0, 0, scaledWidth, scaledHeight)
  }

  private draw = (time: number) => {
    if (!this.width || !this.height) return

    const gl = this.gl
    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const [c0, c1, c2, c3] = pickColors(this.palette)
    const softness = Math.max(0.05, Math.min(0.45, this.settings.softness / 140))
    const opacity = Math.max(0.2, Math.min(0.9, this.settings.opacity))
    const noise = Math.max(0.0, Math.min(1.0, this.settings.noiseAmount / 0.4))
    const scale = 1.0 - (Math.max(120, Math.min(320, this.settings.grainScale)) - 120) / 200 * 0.35

    if (this.uResolution) gl.uniform2f(this.uResolution, this.width, this.height)
    if (this.uTime) gl.uniform1f(this.uTime, time / 1000)
    if (this.uSoftness) gl.uniform1f(this.uSoftness, softness)
    if (this.uOpacity) gl.uniform1f(this.uOpacity, opacity)
    if (this.uNoise) gl.uniform1f(this.uNoise, noise)
    if (this.uScale) gl.uniform1f(this.uScale, scale)

    if (this.uColA) gl.uniform3f(this.uColA, c0.r, c0.g, c0.b)
    if (this.uColB) gl.uniform3f(this.uColB, c1.r, c1.g, c1.b)
    if (this.uColC) gl.uniform3f(this.uColC, c2.r, c2.g, c2.b)
    if (this.uColD) gl.uniform3f(this.uColD, c3.r, c3.g, c3.b)

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND)

    gl.drawArrays(gl.TRIANGLES, 0, 6)
    gl.bindVertexArray(null)
  }

  private animate = (time: number) => {
    if (!this.isPaused) {
      this.draw(time)
    }
    this.frameId = requestAnimationFrame(this.animate)
  }

  private handleVisibility = () => {
    this.isPaused = document.hidden
  }

  public destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    } else {
      window.removeEventListener('resize', this.resize)
    }
    document.removeEventListener('visibilitychange', this.handleVisibility)
    cancelAnimationFrame(this.frameId)
  }
}

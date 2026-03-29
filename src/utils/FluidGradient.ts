export class FluidGradient {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private time = 0;
  private frameId = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context");
    this.ctx = ctx;

    this.resize();
    window.addEventListener("resize", this.resize);

    this.animate();
  }

  private resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  };

  private draw() {
    const { ctx, width, height, time } = this;

    // clear
    ctx.clearRect(0, 0, width, height);

    // base
    ctx.fillStyle = "#f6f3ef";
    ctx.fillRect(0, 0, width, height);

    // blobs (SAFE VERSION — no blending yet)
    const blobs = [
      { x: 0.3, y: 0.3, r: 300, color: "rgba(255, 0, 0, 0.4)" },
      { x: 0.7, y: 0.4, r: 350, color: "rgba(255, 100, 100, 0.3)" },
      { x: 0.5, y: 0.7, r: 400, color: "rgba(255, 200, 200, 0.5)" },
    ];

    blobs.forEach((b, i) => {
      const x =
        width * b.x +
        Math.sin(time * 0.5 + i) * 100;

      const y =
        height * b.y +
        Math.cos(time * 0.4 + i) * 100;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, b.r);

      grad.addColorStop(0, b.color);
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    });
  }

  private animate = () => {
    this.time += 0.01;
    this.draw();
    this.frameId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    window.removeEventListener("resize", this.resize);
    cancelAnimationFrame(this.frameId);
  }
}
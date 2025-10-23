/**
 * Performance monitoring utilities
 */

export interface PerfStats {
  fps: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
}

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private maxSamples: number;
  private lastTime: number = 0;
  private frameCount: number = 0;

  public updateTime: number = 0;
  public renderTime: number = 0;

  constructor(maxSamples: number = 60) {
    this.maxSamples = maxSamples;
  }

  /**
   * Begin frame timing
   */
  beginFrame(): void {
    this.lastTime = performance.now();
  }

  /**
   * Mark update phase complete
   */
  markUpdate(): void {
    this.updateTime = performance.now() - this.lastTime;
  }

  /**
   * End frame timing
   */
  endFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastTime;

    this.renderTime = frameTime - this.updateTime;
    this.frameTimes.push(frameTime);

    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    this.frameCount++;
  }

  /**
   * Get current statistics
   */
  getStats(): PerfStats {
    const avgFrameTime =
      this.frameTimes.length > 0
        ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
        : 0;

    return {
      fps: avgFrameTime > 0 ? 1000 / avgFrameTime : 0,
      frameTime: avgFrameTime,
      updateTime: this.updateTime,
      renderTime: this.renderTime,
    };
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.frameTimes = [];
    this.frameCount = 0;
    this.updateTime = 0;
    this.renderTime = 0;
  }
}

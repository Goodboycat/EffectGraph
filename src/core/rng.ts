/**
 * Seedable random number generator (Mulberry32)
 * Provides deterministic random numbers for reproducible effects
 */

export class SeededRNG {
  private state: number;

  constructor(seed: number = Date.now()) {
    // Ensure seed is a positive 32-bit integer
    this.state = Math.abs(seed | 0) || 1;
  }

  /**
   * Get the next random number [0, 1)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Get random integer in range [min, max)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Get random float in range [min, max)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Get random boolean
   */
  nextBoolean(): boolean {
    return this.next() < 0.5;
  }

  /**
   * Random point in unit sphere using rejection sampling
   */
  nextVec3InSphere(): [number, number, number] {
    let x: number, y: number, z: number, lengthSq: number;
    do {
      x = this.nextFloat(-1, 1);
      y = this.nextFloat(-1, 1);
      z = this.nextFloat(-1, 1);
      lengthSq = x * x + y * y + z * z;
    } while (lengthSq > 1);
    return [x, y, z];
  }

  /**
   * Random point on unit sphere surface
   */
  nextVec3OnSphere(): [number, number, number] {
    const [x, y, z] = this.nextVec3InSphere();
    const len = Math.sqrt(x * x + y * y + z * z);
    if (len === 0) return [0, 1, 0];
    return [x / len, y / len, z / len];
  }

  /**
   * Random point in unit box [-1, 1]^3
   */
  nextVec3InBox(): [number, number, number] {
    return [this.nextFloat(-1, 1), this.nextFloat(-1, 1), this.nextFloat(-1, 1)];
  }

  /**
   * Random point in cone (along +Y axis)
   * @param angle - Half-angle in radians
   */
  nextVec3InCone(angle: number): [number, number, number] {
    const cosAngle = Math.cos(angle);
    const z = this.nextFloat(cosAngle, 1);
    const phi = this.nextFloat(0, Math.PI * 2);
    const theta = Math.acos(z);
    const sinTheta = Math.sin(theta);

    return [sinTheta * Math.cos(phi), z, sinTheta * Math.sin(phi)];
  }

  /**
   * Reset to initial seed
   */
  reset(seed: number): void {
    this.state = Math.abs(seed | 0) || 1;
  }

  /**
   * Get current state (for serialization)
   */
  getState(): number {
    return this.state;
  }

  /**
   * Set state (for deserialization)
   */
  setState(state: number): void {
    this.state = state;
  }
}

/**
 * Global RNG instance
 */
let globalRNG: SeededRNG = new SeededRNG();

/**
 * Set seed for global RNG
 */
export function setSeed(seed: number): void {
  globalRNG = new SeededRNG(seed);
}

/**
 * Get global RNG instance
 */
export function getRNG(): SeededRNG {
  return globalRNG;
}

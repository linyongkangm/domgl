import { Color } from '../interface';

/**
 * 到这里已经是interval[0, 255]的值
 */
export class FragmentBuffer {
  public readonly buffer: Uint8ClampedArray;
  public readonly width: number;
  public readonly height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const size = this.width * this.height * 4;
    this.buffer = new Uint8ClampedArray(size);
  }
  public get size() {
    return this.buffer.length;
  }
  public bufferColor(at: number, color: Uint8ClampedArray) {
    if (color.length !== 4) {
      throw new Error('not color');
    }
    if (at % 4 !== 0) {
      throw new Error('not buffer color start');
    }
    this.bufferData(at, color);
  }
  public bufferData(at: number, data: Uint8ClampedArray) {
    this.buffer.set(data, at);
  }
  public bufferValue(at: number, value: number) {
    this.buffer[at] = value;
  }
  public clear(color: Uint8ClampedArray = new Uint8ClampedArray([0, 0, 0, 255])) {
    for (let i = 0; i < this.size; i = i + 4) {
      this.bufferColor(i, color);
    }
  }
  public toUint8ClampedArray() {
    return this.buffer;
  }
}

/**
 * 这里转一层
 * at: interval[-1, 1] -> interval[0, width | height]
 * Color: interval[0, 1] -> interval[0, 255]
 */
export class FragmentBufferProxy {
  private readonly fragmentBuffer: FragmentBuffer;
  constructor(width: number, height: number) {
    this.fragmentBuffer = new FragmentBuffer(width, height);
  }
  public get size() {
    return this.fragmentBuffer.size;
  }
  /**
   *
   * @param x interval[-1, 1]
   * @param y interval[-1, 1]
   * @param color [interval[0, 1] * 4]
   */
  public bufferColor(x: number, y: number, color: Color = [0, 0, 0, 1]) {
    const indexX = Math.min(Math.floor(((x + 1) / 2) * this.fragmentBuffer.width), this.fragmentBuffer.width - 1);
    const indexY = Math.min(Math.floor(((-y + 1) / 2) * this.fragmentBuffer.height), this.fragmentBuffer.height - 1);
    const at = indexY * this.fragmentBuffer.width + indexX * 4;
    this.fragmentBuffer.bufferColor(at, this.colorToUint8ClampedArray(color));
  }
  /**
   *
   * @param color [interval[0, 1] * 4]
   */
  public clear(color: Color = [0, 0, 0, 1]) {
    this.fragmentBuffer.clear(this.colorToUint8ClampedArray(color));
  }
  public toUint8ClampedArray() {
    return this.fragmentBuffer.toUint8ClampedArray();
  }
  private colorToUint8ClampedArray(color: Color = [0, 0, 0, 1]) {
    return new Uint8ClampedArray(
      color.map((item) => {
        return Math.round(item * 255);
      })
    );
  }
}

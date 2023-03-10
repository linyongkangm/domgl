import { Buffer } from './buffer/Buffer';

export class AttribLocation {
  public getCurrentData?(): Float32Array | undefined;
  public setData(data: Float32Array): void;
  public setData(buffer: Buffer, size: number, normalized: boolean, stride: number, offset: number): void;
  public setData(data: Float32Array | Buffer, size?: number, normalized?: boolean, stride?: number, offset?: number) {
    if (data instanceof Buffer) {
      const buffer = data;
      this.linkBuffer(buffer, size as number, normalized as boolean, stride as number, offset as number);
    } else {
      this.linkData(data);
    }
  }
  private data?: Float32Array;
  private linkData(data: Float32Array) {
    this.data = data;
    this.getCurrentData = this.getData;
  }
  private getData() {
    return this.data;
  }

  private bufferPointer?: {
    buffer: Buffer;
    size: number;
    normalized: boolean;
    stride: number;
    offset: number;
  };
  private currentAt = 0;
  private linkBuffer(buffer: Buffer, size: number, normalized: boolean, stride: number, offset: number) {
    this.currentAt = 0;
    this.bufferPointer = { buffer, size, normalized, stride, offset };
    this.getCurrentData = this.getBufferData;
  }
  private getBufferData() {
    if (this.bufferPointer) {
      const start = this.currentAt + this.bufferPointer.offset;
      const end = start + this.bufferPointer.size;
      const data = this.bufferPointer.buffer.subarray(start, end);
      this.currentAt = this.currentAt + (this.bufferPointer.stride || this.bufferPointer.size);
      return data;
    }
  }
}

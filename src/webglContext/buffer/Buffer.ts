import { BufferTarget } from '../interface';

export class Buffer {
  private buffer: Float32Array = new Float32Array();
  public target: BufferTarget = BufferTarget.ARRAY_BUFFER;
  public bufferData(data: Float32Array) {
    this.buffer = new Float32Array(data);
  }
  public subarray(begin?: number, end?: number) {
    return this.buffer.subarray(begin, end);
  }
}

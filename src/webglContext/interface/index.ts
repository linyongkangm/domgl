export type Pigment = number;
export type Color = [Pigment, Pigment, Pigment, Pigment];
export type ScreenPosition = { x: number; y: number };
export type FragmentBufferData = [ScreenPosition, Color];
export interface ICanvas {
  width: number;
  height: number;
  render(buffer: { values: IBuffer<FragmentBufferData>['values'] }): void;
  clear(red: Pigment, green: Pigment, blue: Pigment, alpha: Pigment): void;
}

export abstract class IBuffer<T> {
  private buffer: Set<T> = new Set<T>();
  public bufferData(data: T) {
    this.buffer.add(data);
  }
  public deleteData(data: T) {
    this.buffer.delete(data);
  }
  public clear() {
    this.buffer.clear();
  }
  public values() {
    return this.buffer.values();
  }
  public has(data: T) {
    return this.buffer.has(data);
  }
}

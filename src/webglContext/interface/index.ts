export type Vec1 = [number];
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
export type Vec = Vec1 | Vec2 | Vec3 | Vec4;
export type Pigment = number;
export type Color = Vec4;
export type ScreenPosition = { x: number; y: number };
export type FragmentBufferData = [ScreenPosition, Color];
export type ShaderPosition = Vec4;
export type VertexShaderExecutorPayload = { Position?: ShaderPosition; PointSize?: number };
export type VertexShaderExecutorParams = { attribute: { [key: string]: Vec }; uniform: { [key: string]: Vec } };
export type VertexShaderExecutor = (gl: VertexShaderExecutorPayload, params: VertexShaderExecutorParams) => void;
export type FragmentShaderExecutorPayload = { FragColor?: Color };
export type FragmentShaderExecutorParams = { uniform: { [key: string]: Vec } };
export type FragmentShaderExecutor = (gl: FragmentShaderExecutorPayload, params: FragmentShaderExecutorParams) => void;
export type ShaderExecutor = VertexShaderExecutor | FragmentShaderExecutor;
export interface ICanvas {
  width: number;
  height: number;
  render(buffer: Uint8ClampedArray): void;
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

export enum DrawArraysMode {
  POINTS,
  LINES,
  LINE_STRIP,
  LINE_LOOP,
  TRIANGLES,
  TRIANGLES_STRIP,
  TRIANGLES_FAN,
}

export enum ShaderType {
  VERTEX_SHADER,
  FRAGMENT_SHADER,
}

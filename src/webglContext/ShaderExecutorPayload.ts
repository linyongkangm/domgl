import { VertexShaderExecutorPayload, FragmentShaderExecutorPayload, ShaderPosition, Color } from './interface';

export class ShaderExecutorPayload implements VertexShaderExecutorPayload, FragmentShaderExecutorPayload {
  PointSize = 1;
  Position?: ShaderPosition;
  FragColor?: Color;
  private width: number;
  private height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  // y轴没反转，就是按宽高缩放了值
  public get zoomPosition() {
    if (this.Position) {
      const [x, y] = this.Position;
      const width = this.width;
      const height = this.height;
      const positionX = Math.floor(x * (width / 2));
      const positionY = Math.floor(y * (height / 2));
      return { x: positionX, y: positionY };
    }
  }
  public setPositionFromZoomPosition(zoomPosition: { x: number; y: number }) {
    this.Position = new Float32Array([zoomPosition.x / (this.width / 2), zoomPosition.y / (this.height / 2), 0, 1]);
  }
  public get fragmentBufferIndex() {
    const fragmentBufferPosition = this.fragmentBufferPosition;
    if (fragmentBufferPosition) {
      const at = (fragmentBufferPosition.y * this.width + fragmentBufferPosition.x) * 4;
      return at;
    }
  }
  // y轴反转了，适配canvas的坐标系
  public get fragmentBufferPosition() {
    if (this.Position) {
      const [x, y] = this.Position;
      const width = this.width;
      const height = this.height;
      const indexX = Math.min(Math.floor(((x + 1) / 2) * width), width - 1);
      const indexY = Math.min(Math.floor(((-y + 1) / 2) * height), height - 1);
      return { x: indexX, y: indexY };
    }
  }
  public setPositionFromFragmentBufferPosition(fragmentBufferPosition: { x: number; y: number }) {
    this.Position = new Float32Array([
      fragmentBufferPosition.x / this.width,
      fragmentBufferPosition.y / this.height,
      0,
      1,
    ]);
  }
}

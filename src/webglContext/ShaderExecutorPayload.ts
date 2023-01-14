import { VertexShaderExecutorPayload, FragmentShaderExecutorPayload, ShaderPosition, Color } from './interface';
import { math } from './utils/math';

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
    this.Position = new Float32Array([
      math.evaluate(`${zoomPosition.x} / (${this.width} / 2)`),
      math.evaluate(`${zoomPosition.y} / (${this.height} / 2)`),
      0.0,
      1.0,
    ]);
  }
}

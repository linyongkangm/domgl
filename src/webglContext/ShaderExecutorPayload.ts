import { VertexShaderExecutorPayload, FragmentShaderExecutorPayload, ShaderPosition, Color, Vec } from './interface';
import { math } from './utils/math';

export class ShaderExecutorPayload implements VertexShaderExecutorPayload, FragmentShaderExecutorPayload {
  PointSize = 1;
  FragColor?: Color;
  __varying?: { [key: string]: Vec } = {};
  private width: number;
  private height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  private originPosition?: ShaderPosition;
  public set Position(position: ShaderPosition) {
    this.originPosition = position;
    const [x, y] = this.originPosition;
    const width = this.width;
    const height = this.height;
    const positionX = Math.floor(x * (width / 2));
    const positionY = Math.floor(y * (height / 2));
    this.zoomPosition = new Float32Array([positionX, positionY, 0, 1]);
  }
  public get Position() {
    return this.originPosition as ShaderPosition;
  }

  private _zoomPosition?: ShaderPosition;

  // y轴没反转，就是按宽高缩放了值
  public get zoomPosition() {
    return this._zoomPosition as ShaderPosition;
  }
  public set zoomPosition(zoomPosition: ShaderPosition) {
    this.originPosition = new Float32Array([
      math.evaluate(`${zoomPosition[0]} / (${this.width} / 2)`),
      math.evaluate(`${zoomPosition[1]} / (${this.height} / 2)`),
      zoomPosition[2],
      zoomPosition[3],
    ]);
    this._zoomPosition = zoomPosition;
  }
  public sameZoomPosition(zoomPosition: ShaderPosition) {
    return this.zoomPosition[0] === zoomPosition[0] && this.zoomPosition[1] === zoomPosition[1];
  }
}

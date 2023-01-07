import { FragmentBuffer } from './buffer';
import { ICanvas, Pigment } from './interface';

export class WebglContext {
  private fragmentBuffer = new FragmentBuffer();
  public get COLOR_BUFFER_BIT() {
    return this.fragmentBuffer;
  }
  private canvas: ICanvas;
  constructor(canvas: ICanvas) {
    this.canvas = canvas;
  }

  public claerColor(red: Pigment = 0.0, green: Pigment = 0.0, blue: Pigment = 0.0, alpha: Pigment = 0.0) {
    this.canvas.clear(red, green, blue, alpha);
  }
  public clear(buffer: WebglContext['COLOR_BUFFER_BIT']) {
    buffer.clear();
  }
}

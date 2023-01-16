import { TextureTarget, TexturePname, TextureParam } from './interface';
import { math } from './utils/math';

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
document.body.append(canvas);
export class Texture {
  private imageData?: ImageData;
  public updateImage(image: HTMLImageElement) {
    canvas.width = image.width;
    canvas.height = image.height;
    context?.drawImage(image, 0, 0, image.width, image.height);
    this.imageData = context?.getImageData(0, 0, image.width, image.height);
  }
  public getColor(coord: Float32Array) {
    if (this.imageData) {
      const [x, y] = coord;
      const { width, height } = this.imageData;
      const start = math.number(
        math.evaluate(`(floor(${y} * ${height - 1}) * ${width} + floor(${x} * ${width - 1})) * 4`)
      );
      const end = start + 4;
      return this.imageData.data.slice(start, end);
    }
  }
}
export class TextureTargetProxy {
  private target: TextureTarget;
  private texture: Texture;
  private param = new Map<TexturePname, TextureParam>();
  constructor(target: TextureTarget, texture: Texture) {
    this.target = target;
    this.texture = texture;
  }
  public texParameteri(pname: TexturePname, param: TextureParam) {
    this.param.set(pname, param);
  }
  public texImage2D(image: HTMLImageElement) {
    this.texture.updateImage(image);
  }
  public getTarget() {
    return this.target;
  }
  public getColorByCoord(coord: Float32Array) {
    const color = this.texture.getColor(new Float32Array([coord[0], 1 - coord[1]]));
    if (color) {
      return new Float32Array(Array.from({ length: 4 }).map((_, index) => (color.at(index) || 0) / 255));
    }
  }
}

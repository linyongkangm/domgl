import { IBuffer, FragmentBufferData, ScreenPosition, Color } from '../interface';

export class FragmentBuffer extends IBuffer<FragmentBufferData> {
  public bufferColor(position: ScreenPosition, color: Color) {
    this.bufferData([position, color]);
  }
}

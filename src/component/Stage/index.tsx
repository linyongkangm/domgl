import { ICanvas } from '@/webglContext';
import { CSSProperties, forwardRef, useImperativeHandle, useRef } from 'react';
import './index.less';

const Stage = forwardRef<
  ICanvas,
  {
    width: number;
    height: number;
    style?: CSSProperties;
  }
>((props, ref) => {
  const stageRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(
    ref,
    () => {
      const stage = stageRef.current;
      const ctx = stage?.getContext('2d');
      return {
        width: props.width,
        height: props.height,
        clear(r, g, b, a) {
          if (ctx) {
            ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
            ctx.fillRect(0, 0, props.width, props.height);
          }
        },
        render(buffer) {
          if (!ctx) {
            return;
          }
          const dataSource = buffer.values();

          const length = props.width * props.height * 4;
          const view = new DataView(new ArrayBuffer(length));
          for (let i = 3; i < length; i = i + 4) {
            view.setUint8(i, 255);
          }
          for (const data of dataSource) {
            console.log(data);
            const [position, color] = data;
            const item = (props.height * position.y + position.x) * 4;
            color.forEach((comp, index) => {
              view.setUint8(item + index, comp * 255);
            });
          }
          const uintc8 = new Uint8ClampedArray(view.buffer);
          const imageData = new ImageData(uintc8, props.width, props.height);
          ctx.putImageData(imageData, 0, 0);
        },
      };
    },
    [props.width, props.height]
  );
  return <canvas ref={stageRef} width={props.width} height={props.height} style={props.style}></canvas>;
});
export default Stage;

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
          const ctx = stage?.getContext('2d');
          if (ctx) {
            const imageData = new ImageData(buffer, props.width, props.height);
            ctx.putImageData(imageData, 0, 0);
          }
        },
      };
    },
    [props.width, props.height]
  );
  return <canvas ref={stageRef} width={props.width} height={props.height} style={props.style}></canvas>;
});
export default Stage;

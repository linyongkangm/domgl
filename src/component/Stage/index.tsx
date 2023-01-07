import { ICanvas } from '@/webglContext';
import { CSSProperties, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import './index.less';

const Stage = forwardRef<
  ICanvas,
  {
    width: number;
    height: number;
    style?: CSSProperties;
  }
>((props, ref) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const total = useMemo(() => props.width * props.height, [props.width, props.height]);
  const styleElement = useMemo(() => {
    const element = document.createElement('style');
    document.head.appendChild(element);
    return element;
  }, []);
  useEffect(() => {
    styleElement.innerHTML = `
      .pixel_block {
        width: ${100 / props.width}%;
        height: ${100 / props.height}%;
      }
    `;
  }, [props.width, props.height]);

  useImperativeHandle(
    ref,
    () => {
      return {
        width: props.width,
        height: props.height,
        clear(r, g, b, a) {
          const stage = stageRef.current;
          if (stage) {
            const pixelBlock = stage.getElementsByClassName('pixel_block');
            for (const block of pixelBlock) {
              const rgba = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
              (block as HTMLDivElement).style.background = rgba;
            }
          }
        },
        render(buffer) {
          const dataSource = buffer.values();
          const stage = stageRef.current;
          if (stage) {
            const pixelBlock = stage.getElementsByClassName('pixel_block');
            for (const data of dataSource) {
              const [position, color] = data;
              const [r, g, b, a] = color;
              const rgba = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
              const block = pixelBlock.item(props.height * position.y + position.x) as HTMLDivElement;
              if (block) {
                block.style.background = rgba;
              }
            }
          }
        },
      };
    },
    [props.width, props.height]
  );
  return (
    <div className='stage' style={props.style} ref={stageRef}>
      {Array.from({ length: total }).map((_, index) => {
        return <div className='pixel_block' key={index}></div>;
      })}
    </div>
  );
});
export default Stage;

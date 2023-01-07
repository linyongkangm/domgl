import { CSSProperties, FC, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import ReactDOM from 'react-dom';
import './index.less';

interface GLContext {
  claer(color: string): void;
}

const VElement: FC = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => {
    return {
      to,
    };
  });
  return <div></div>;
});

function withReactStyleToHTMLStyle() {
  const dom = document.createElement('div');
  document.body.appendChild(dom);
  ReactDOM.createPortal(<VElement></VElement>, dom);
  return function reactStyleToHTMLStyle(style: CSSProperties) {};
}

const Stage: FC<{
  width: number;
  height: number;
  style?: CSSProperties;
}> = forwardRef((props, ref) => {
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
  const stageRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => {
    return {};
  });
  return (
    <div className='stage' style={props.style} ref={stageRef}>
      {Array.from({ length: total }).map((_, index) => {
        return <div className='pixel_block' key={index}></div>;
      })}
    </div>
  );
});
export default Stage;

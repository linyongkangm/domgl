import Stage from '@/component/Stage';
import { ICanvas } from '@/webglContext';
import { WebglContext } from '@/webglContext/WebglContext';
import { useEffect, useRef } from 'react';
export default function HomePage() {
  const stageRef = useRef<ICanvas>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const context = new WebglContext(stage);
    context.claerColor(1.0, 0.0, 0.0, 1.0);
  }, []);
  return (
    <div>
      <Stage ref={stageRef} width={30} height={30} style={{ width: 500, height: 500 }}></Stage>
    </div>
  );
}

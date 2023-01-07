import Stage from '@/component/Stage';
import { DrawArraysMode, FragmentShaderExecutor, ICanvas, ShaderType, VertexShaderExecutor } from '@/webglContext';
import { WebglContext } from '@/webglContext/WebglContext';
import { useEffect, useRef } from 'react';

function initShader(
  context: WebglContext,
  vertexExecutor: VertexShaderExecutor,
  fragmentExecutor: FragmentShaderExecutor
) {
  const vertexShader = context.createShader(ShaderType.VERTEX_SHADER);
  const fragmentShader = context.createShader(ShaderType.FRAGMENT_SHADER);

  context.shaderSource(vertexShader, vertexExecutor);
  context.shaderSource(fragmentShader, fragmentExecutor);

  context.compileShader(vertexShader);
  context.compileShader(fragmentShader);

  const program = context.createProgram();
  context.attachShader(program, vertexShader);
  context.attachShader(program, fragmentShader);

  context.linkProgram(program);
  context.useProgram(program);
}

export default function HomePage() {
  const stageRef = useRef<ICanvas>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const context = new WebglContext(stage);

    initShader(
      context,
      (gl) => {
        gl.Position = [0, 0, 0, 1];
      },
      (gl) => {
        gl.FragColor = [1, 0, 0, 1];
      }
    );

    context.claerColor(0.0, 1.0, 0.0, 1.0);
    context.clear(context.COLOR_BUFFER_BIT);

    context.drawArrays(DrawArraysMode.POINTS, 0, 1);
  }, []);
  return (
    <div>
      <Stage ref={stageRef} width={30} height={30} style={{ width: 500, height: 500 }}></Stage>
    </div>
  );
}

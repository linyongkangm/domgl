import Stage from '@/component/Stage';
import {
  DrawArraysMode,
  FragmentShaderExecutor,
  ICanvas,
  ShaderType,
  Vec4,
  VertexShaderExecutor,
} from '@/webglContext';
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
      (gl, params) => {
        gl.Position = params.attribute.a_Position as Vec4;
        console.log(params.attribute.a_Color);
      },
      (gl, params) => {
        gl.FragColor = params.uniform.u_FragColor as Vec4;
      }
    );
    if (!context.program) {
      return;
    }

    const vertexBuffer = context.createBuffer();
    const vertices = [
      [0.0, 0.5, 0, 0, 1],
      [-0.5, 0.0, 0, 0, 1],
      [0.0, -0.5, 0, 0, 1],
      [0.0, 0.5, 0, 0, 1],
      [0.0, -0.5, 0, 0, 1],
      [0.5, 0, 0, 0, 1],
    ];
    context.bindBuffer(context.ARRAY_BUFFER, vertexBuffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(([] as number[]).concat(...vertices)));
    context.vertexAttribPointer(context.getAttribLocation(context.program, 'a_Position'), 2, false, 5, 0);

    context.bindBuffer(context.ARRAY_BUFFER, vertexBuffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(([] as number[]).concat(...vertices)));
    context.vertexAttribPointer(context.getAttribLocation(context.program, 'a_Color'), 3, false, 5, 2);

    context.uniform4f(context.getUniformLocation(context.program, 'u_FragColor'), 0, 0, 1, 1);

    context.claerColor(0.0, 1.0, 0.0, 1.0);
    context.clear(context.COLOR_BUFFER_BIT);

    context.drawArrays(DrawArraysMode.TRIANGLES, 0, vertices.length);
  }, []);
  return <Stage ref={stageRef} width={30} height={30} style={{ width: 500, height: 500 }}></Stage>;
}

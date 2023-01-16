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
    (async () => {
      const stage = stageRef.current;
      if (!stage) {
        return;
      }
      const context = new WebglContext(stage);
      initShader(
        context,
        (gl, params) => {
          gl.Position = params.attribute.a_Position as Vec4;
          params.varying.v_TexCoord = params.attribute.a_TexCoord;
        },
        (gl, params) => {
          const color = gl.texture2D?.(params.uniform.u_Sampler, params.varying.v_TexCoord);
          gl.FragColor = color;
        }
      );
      if (!context.program) {
        return;
      }

      const vertexBuffer = context.createBuffer();
      const vertices = [
        [-0.5, 0.5, 0, 1],
        [-0.5, -0.5, 0, 0],
        [0.5, 0.5, 1, 1],
        [0.5, -0.5, 1, 0],
      ];
      context.bindBuffer(context.ARRAY_BUFFER, vertexBuffer);
      context.bufferData(context.ARRAY_BUFFER, new Float32Array(([] as number[]).concat(...vertices)));
      context.vertexAttribPointer(context.getAttribLocation(context.program, 'a_Position'), 2, false, 4, 0);

      context.vertexAttribPointer(context.getAttribLocation(context.program, 'a_TexCoord'), 2, false, 4, 2);

      const image = new Image();
      await new Promise((resolve) => {
        image.onload = resolve;
        image.src = require('@/assets/image.png');
      });

      context.pixelStorei();
      const texture = context.createTexture();
      const u_Sampler = context.getUniformLocation(context.program, 'u_Sampler');
      context.activeTexture(context.TEXTURE0);
      context.bindTexture(context.TEXTURE_2D, texture);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
      context.texImage2D(context.TEXTURE_2D, 0, context.RGB, context.RGB, context.UNSIGNED_BYTE, image);
      context.uniformli(u_Sampler, context.TEXTURE0);

      context.claerColor(0.0, 1.0, 0.0, 1.0);
      context.clear(context.COLOR_BUFFER_BIT);

      context.drawArrays(DrawArraysMode.TRIANGLES_STRIP, 0, vertices.length);
    })();
  }, []);
  return <Stage ref={stageRef} width={10} height={10} style={{ width: 500, height: 500 }}></Stage>;
}

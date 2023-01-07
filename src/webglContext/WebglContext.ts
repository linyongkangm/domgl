import { FragmentBuffer } from './buffer';
import {
  ICanvas,
  Pigment,
  DrawArraysMode,
  ShaderType,
  ShaderExecutor,
  VertexShaderExecutor,
  FragmentShaderExecutor,
  VertexShaderExecutorPayload,
  FragmentShaderExecutorPayload,
} from './interface';
import { Program } from './Program';
import { FragmentShader, Shader, VertexShader } from './Shader';

export class WebglContext {
  private fragmentBuffer = new FragmentBuffer();
  public get COLOR_BUFFER_BIT() {
    return this.fragmentBuffer;
  }
  private canvas: ICanvas;
  constructor(canvas: ICanvas) {
    this.canvas = canvas;
  }

  public claerColor(red: Pigment = 0.0, green: Pigment = 0.0, blue: Pigment = 0.0, alpha: Pigment = 0.0) {
    this.canvas.clear(red, green, blue, alpha);
  }
  public clear(buffer: WebglContext['COLOR_BUFFER_BIT']) {
    buffer.clear();
  }
  public createShader(type: ShaderType.VERTEX_SHADER): VertexShader;
  public createShader(type: ShaderType.FRAGMENT_SHADER): FragmentShader;
  public createShader(type: ShaderType): Shader {
    return Shader.create(type);
  }
  public shaderSource(shader: VertexShader, executor: VertexShaderExecutor): void;
  public shaderSource(shader: FragmentShader, executor: FragmentShaderExecutor): void;
  public shaderSource(shader: Shader, executor: ShaderExecutor) {
    shader.registerExecutor(executor);
  }
  public compileShader(shader: Shader) {
    shader.compileExecutor();
  }
  private programs = new Set<Program>();
  private currentProgram?: Program;
  public createProgram(): Program {
    return new Program();
  }
  public attachShader(program: Program, shader: Shader) {
    program.attachShader(shader);
  }

  public linkProgram(program: Program) {
    this.programs.add(program);
  }
  public useProgram(program: Program) {
    if (this.programs.has(program)) {
      this.currentProgram = program;
    }
  }

  private willRasterizeFragmentPayload: {
    vertexShaderExecutorPayload?: VertexShaderExecutorPayload;
    fragmentShaderExecutorPayload?: FragmentShaderExecutorPayload;
  }[] = [];
  public drawArrays(mode: DrawArraysMode, first: number, count: number) {
    this.willRasterizeFragmentPayload = [];
    // 绘制顶点
    while (count--) {
      this.drawPoint();
    }
    // 装配图元
    this.assemble();
    // 光栅化
    this.rasterize();

    // 渲染
    this.render();
  }

  private drawPoint() {
    const payload: VertexShaderExecutorPayload = {};
    this.currentProgram?.vertexShader?.executor?.(payload);
    if (payload.Position) {
      this.willRasterizeFragmentPayload.push({
        vertexShaderExecutorPayload: payload,
      });
    }
  }

  private assemble() {
    console.log(this.willRasterizeFragmentPayload);
  }
  private rasterize() {
    this.willRasterizeFragmentPayload.forEach((fragment) => {
      const payload: FragmentShaderExecutorPayload = {};
      this.currentProgram?.fragmentShader?.executor?.(payload);
      fragment.fragmentShaderExecutorPayload = payload;

      this.draw(fragment);
    });
  }
  private draw(fragmentPayload: WebglContext['willRasterizeFragmentPayload'][0]) {
    const shaderPosition = fragmentPayload.vertexShaderExecutorPayload?.Position;
    if (!shaderPosition) {
      return;
    }
    const pxPosition = {
      x: ((shaderPosition[0] + 1) / 2) * this.canvas.width,
      y: ((-shaderPosition[1] + 1) / 2) * this.canvas.height,
    };
    const indexPosition = {
      x: Math.min(Math.floor(pxPosition.x), this.canvas.width - 1),
      y: Math.min(Math.floor(pxPosition.y), this.canvas.height - 1),
    };
    const color = fragmentPayload.fragmentShaderExecutorPayload?.FragColor;
    if (color) {
      this.fragmentBuffer.bufferData([indexPosition, color]);
    }
  }
  private render() {
    this.canvas.render(this.fragmentBuffer);
  }
}

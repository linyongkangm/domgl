import { FragmentBufferProxy } from './buffer';
import {
  ICanvas,
  Pigment,
  DrawArraysMode,
  ShaderType,
  ShaderExecutor,
  VertexShaderExecutor,
  FragmentShaderExecutor,
} from './interface';
import { Program } from './Program';
import { FragmentShader, Shader, VertexShader } from './Shader';

export class WebglContext {
  private fragmentBuffer: FragmentBufferProxy;
  public get COLOR_BUFFER_BIT() {
    return this.fragmentBuffer;
  }
  private canvas: ICanvas;
  constructor(canvas: ICanvas) {
    this.canvas = canvas;
    this.fragmentBuffer = new FragmentBufferProxy(this.canvas.width, this.canvas.height);
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
  public get program() {
    return this.currentProgram;
  }
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
  public getAttribLocation(program: Program, name: string) {
    return program.getAttribLocation(name);
  }
  public getUniformLocation(program: Program, name: string) {
    return program.getUniformLocation(name);
  }
  public vertexAttrib3f(location: ReturnType<WebglContext['getAttribLocation']>, a: number, b: number, c: number) {
    location([a, b, c]);
  }
  public vertexAttrib4f(
    location: ReturnType<WebglContext['getAttribLocation']>,
    a: number,
    b: number,
    c: number,
    d: number
  ) {
    location([a, b, c, d]);
  }
  public uniform3f(location: ReturnType<WebglContext['getUniformLocation']>, a: number, b: number, c: number) {
    location([a, b, c]);
  }
  public uniform4f(
    location: ReturnType<WebglContext['getUniformLocation']>,
    a: number,
    b: number,
    c: number,
    d: number
  ) {
    location([a, b, c, d]);
  }

  public drawArrays(mode: DrawArraysMode, first: number, count: number) {
    this.currentProgram?.resetWillRasterizeFragmentPayload();
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
    this.currentProgram?.execvVertexShader();
  }

  private assemble() {}
  private rasterize() {
    this.currentProgram?.execFragmentShader(this.draw.bind(this));
  }
  private draw(fragmentPayload: Program['willRasterizeFragmentPayload'][0]) {
    const shaderPosition = fragmentPayload.vertexShaderExecutorPayload?.Position;
    if (!shaderPosition) {
      return;
    }

    const color = fragmentPayload.fragmentShaderExecutorPayload?.FragColor;
    if (color) {
      this.fragmentBuffer.bufferColor(shaderPosition[0], shaderPosition[1], color);
    }
  }
  private render() {
    this.canvas.render(this.fragmentBuffer.toUint8ClampedArray());
  }
}

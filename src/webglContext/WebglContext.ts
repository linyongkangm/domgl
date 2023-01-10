import { FragmentBufferProxy } from './buffer/FragmentBuffer';
import { Buffer } from './buffer/Buffer';
import {
  ICanvas,
  Pigment,
  DrawArraysMode,
  ShaderType,
  ShaderExecutor,
  VertexShaderExecutor,
  FragmentShaderExecutor,
  BufferTarget,
  VertexShaderExecutorPayload,
  FragmentShaderExecutorPayload,
} from './interface';
import { Program } from './Program';
import { FragmentShader, Shader, VertexShader } from './Shader';

export class WebglContext {
  private fragmentBuffer: FragmentBufferProxy;
  public get COLOR_BUFFER_BIT() {
    return this.fragmentBuffer;
  }
  private arrayBufferTarget?: Buffer;
  public get ARRAY_BUFFER() {
    return BufferTarget.ARRAY_BUFFER;
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
  public createBuffer() {
    return new Buffer();
  }
  public bindBuffer(target: BufferTarget, buffer: Buffer) {
    if (target === BufferTarget.ARRAY_BUFFER) {
      this.arrayBufferTarget = buffer;
    }
  }
  public bufferData(target: BufferTarget, data: Float32Array) {
    if (target === BufferTarget.ARRAY_BUFFER && this.arrayBufferTarget) {
      this.arrayBufferTarget.bufferData(data);
    }
  }

  public getAttribLocation(program: Program, name: string) {
    return program.getAttribLocation(name);
  }
  public getUniformLocation(program: Program, name: string) {
    return program.getUniformLocation(name);
  }
  public vertexAttribPointer(
    location: ReturnType<WebglContext['getAttribLocation']>,
    size: number,
    normalized: boolean,
    stride: number,
    offset: number
  ) {
    if (this.arrayBufferTarget) {
      location(this.arrayBufferTarget, size, normalized, stride, offset);
    }
  }
  public vertexAttrib3f(location: ReturnType<WebglContext['getAttribLocation']>, a: number, b: number, c: number) {
    location(new Float32Array([a, b, c]));
  }
  public vertexAttrib4f(
    location: ReturnType<WebglContext['getAttribLocation']>,
    a: number,
    b: number,
    c: number,
    d: number
  ) {
    location(new Float32Array([a, b, c, d]));
  }
  public uniform3f(location: ReturnType<WebglContext['getUniformLocation']>, a: number, b: number, c: number) {
    location(new Float32Array([a, b, c]));
  }
  public uniform4f(
    location: ReturnType<WebglContext['getUniformLocation']>,
    a: number,
    b: number,
    c: number,
    d: number
  ) {
    location(new Float32Array([a, b, c, d]));
  }
  private willRasterizeFragmentPayload: (VertexShaderExecutorPayload & FragmentShaderExecutorPayload)[] = [];
  public drawArrays(mode: DrawArraysMode, first: number, count: number) {
    // 绘制顶点
    this.drawPoints(count);
    // 装配图元
    this.assemble();
    // 光栅化
    this.rasterize();
    // 渲染
    this.render();
    this.willRasterizeFragmentPayload = [];
  }

  private drawPoints(count: number) {
    while (count--) {
      const payload = this.currentProgram?.execvVertexShader();
      if (payload) {
        this.willRasterizeFragmentPayload.push(payload);
      }
    }
  }
  // 装配图元
  private assemble() {}
  // 光栅化
  private rasterize() {
    this.willRasterizeFragmentPayload.forEach((payload) => {
      this.currentProgram?.execFragmentShader(payload);
      this.drawFragment(payload);
    });
  }
  private drawFragment(payload: WebglContext['willRasterizeFragmentPayload'][0]) {
    const shaderPosition = payload?.Position;
    if (!shaderPosition) {
      return;
    }

    const color = payload?.FragColor;
    if (color) {
      this.fragmentBuffer.bufferColor(shaderPosition[0], shaderPosition[1], color);
    }
  }
  private render() {
    this.canvas.render(this.fragmentBuffer.toUint8ClampedArray());
  }
}

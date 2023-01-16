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
  ShaderPosition,
  TextureUnit,
  TextureTarget,
  TexturePname,
  TextureParam,
  TextureType,
  TextureFormat,
} from './interface';
import { Program } from './Program';
import { FragmentShader, Shader, VertexShader } from './Shader';
import { ShaderExecutorPayload } from './ShaderExecutorPayload';
import { math } from './utils/math';
import { Texture, TextureTargetProxy } from './Texture';
function group<T>(arr: T[], num: number): T[][] {
  const result: T[][] = [];
  for (let i = 0, len = arr.length; i < len; i += num) {
    result.push(arr.slice(i, i + num));
  }
  return result;
}

function toPoint(array: Float32Array) {
  const point: Point = { x: array.at(0) as number, y: array.at(1) as number };
  return point;
}
interface Point {
  x: number;
  y: number;
}

function pointInTriangle(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
) {
  const pisor = math.evaluate(`(${y2} - ${y3}) * (${x1} - ${x3}) + (${x3} - ${x2}) * (${y1} - ${y3})`);
  const a = math.evaluate(`((${y2} - ${y3}) * (${x0} - ${x3}) + (${x3} - ${x2}) * (${y0} - ${y3}))  / ${pisor}`);
  const b = math.evaluate(`((${y3} - ${y1}) * (${x0} - ${x3}) + (${x1} - ${x3}) * (${y0} - ${y3}))  / ${pisor}`);
  const c = math.evaluate(`1 - ${a} - ${b}`);
  return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
}
function product(p1: Point, p2: Point, p3: Point) {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

function isInTriangle(p1: ShaderPosition, p2: ShaderPosition, p3: ShaderPosition, o: ShaderPosition) {
  return pointInTriangle(o[0], o[1], p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
}

function interpolationTriangle(o: ShaderPosition, p1: ShaderPosition, p2: ShaderPosition, p3: ShaderPosition) {
  const [ox, oy] = o;
  const [p1x, p1y] = p1;
  const [p2x, p2y] = p2;
  const [p3x, p3y] = p3;
  const b = math.number(
    math.evaluate(
      `((${ox} - ${p1x}) * (${p3y} - ${p1y}) - (${p3x} - ${p1x}) * (${oy} - ${p1y})) / ((${p2x} - ${p1x}) * (${p3y} - ${p1y}) - (${p3x} - ${p1x}) * (${p2y} - ${p1y}))`
    )
  );
  const c = math.number(
    math.evaluate(
      `((${ox} - ${p1x}) * (${p2y} - ${p1y}) - (${p2x} - ${p1x}) * (${oy} - ${p1y})) / ((${p3x} - ${p1x}) * (${p2y} - ${p1y}) - (${p2x} - ${p1x}) * (${p3y} - ${p1y}))`
    )
  );
  const a = math.number(math.evaluate(`1 - ${b} - ${c}`));
  return [a, b, c];
}

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
  // 将绑定到ARRAY_BUFFER的缓冲区对象分配给有location指定的attribute对象
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
  public uniformli(location: ReturnType<WebglContext['getUniformLocation']>, unit: TextureUnit) {
    const texTarget = this.textureUnitMap.get(unit);
    if (texTarget) {
      location(texTarget);
    }
  }
  public pixelStorei() {}
  public createTexture() {
    return new Texture();
  }
  private currentActiveTextureUnit?: TextureUnit;
  private textureUnitMap = new Map<TextureUnit, TextureTargetProxy>();
  private get currentActiveTextureProxy() {
    return this.currentActiveTextureUnit !== undefined && this.textureUnitMap.get(this.currentActiveTextureUnit);
  }
  public get TEXTURE0() {
    return TextureUnit.TEXTURE0;
  }
  public get TEXTURE1() {
    return TextureUnit.TEXTURE1;
  }
  public get TEXTURE_2D() {
    return TextureTarget.TEXTURE_2D;
  }
  public get TEXTURE_MIN_FILTER() {
    return TexturePname.TEXTURE_MIN_FILTER;
  }
  public get LINEAR() {
    return TextureParam.LINEAR;
  }
  public get RGB() {
    return TextureFormat.RGB;
  }
  public get UNSIGNED_BYTE() {
    return TextureType.UNSIGNED_BYTE;
  }
  public activeTexture(unit: TextureUnit) {
    this.currentActiveTextureUnit = unit;
  }
  public bindTexture(target: TextureTarget, texture: Texture) {
    if (this.currentActiveTextureUnit !== undefined) {
      this.textureUnitMap.set(this.currentActiveTextureUnit, new TextureTargetProxy(target, texture));
    }
  }
  public texParameteri(target: TextureTarget, pname: TexturePname, params: TextureParam) {
    if (this.currentActiveTextureProxy && this.currentActiveTextureProxy.getTarget() === target) {
      this.currentActiveTextureProxy.texParameteri(pname, params);
    }
  }
  public texImage2D(
    target: TextureTarget,
    level: number,
    internalformat: TextureFormat,
    format: TextureFormat,
    type: TextureType,
    image: HTMLImageElement
  ) {
    if (this.currentActiveTextureProxy && this.currentActiveTextureProxy.getTarget() === target) {
      this.currentActiveTextureProxy.texImage2D(image);
    }
  }
  public drawArrays(mode: DrawArraysMode, first: number, count: number) {
    // 绘制顶点
    this.drawPoints(count);
    // 装配图元
    this.assemble(mode);

    this.vertexShaderResults = [];
    // 光栅化
    this.rasterize(mode);

    this.rasterGroup = [];
    // 渲染
    this.render();
  }
  private vertexShaderResults: ShaderExecutorPayload[] = [];
  private drawPoints(count: number) {
    while (count--) {
      const payload = new ShaderExecutorPayload(this.canvas.width, this.canvas.height);
      this.currentProgram?.execvVertexShader(payload);
      this.vertexShaderResults.push(payload);
    }
  }
  private rasterGroup: ShaderExecutorPayload[][] = [];
  // 装配图元
  private assemble(mode: DrawArraysMode) {
    if (mode === DrawArraysMode.TRIANGLES) {
      this.rasterGroup = group(this.vertexShaderResults, 3);
    } else if (mode === DrawArraysMode.TRIANGLES_STRIP) {
      for (let i = 2; i < this.vertexShaderResults.length; i++) {
        if (i % 2 === 0) {
          this.rasterGroup.push(this.vertexShaderResults.slice(i - 2, i + 1));
        } else {
          this.rasterGroup.push([
            this.vertexShaderResults[i - 1],
            this.vertexShaderResults[i - 2],
            this.vertexShaderResults[i],
          ]);
        }
      }
    }
    this.rasterGroup.forEach((chunk) => {
      const [p1, p2, p3] = chunk;
      const p1Position = p1.zoomPosition;
      const p2Position = p2.zoomPosition;
      const p3Position = p3.zoomPosition;
      if (p1Position && p2Position && p3Position) {
        const minX = Math.min(p1Position[0], p2Position[0], p3Position[0]);
        const minY = Math.min(p1Position[1], p2Position[1], p3Position[1]);
        const maxX = Math.max(p1Position[0], p2Position[0], p3Position[0]);
        const maxY = Math.max(p1Position[1], p2Position[1], p3Position[1]);
        for (let i = minX; i <= maxX; i = i + 1) {
          for (let j = minY; j <= maxY; j = j + 1) {
            const o = new Float32Array([i, j, 0, 1]);
            if (!(p1.sameZoomPosition(o) || p2.sameZoomPosition(o) || p3.sameZoomPosition(o))) {
              const bol = isInTriangle(p1Position, p2Position, p3Position, o);
              if (bol) {
                const payload = new ShaderExecutorPayload(this.canvas.width, this.canvas.height);
                payload.zoomPosition = o;
                chunk.push(payload);
              }
            }
          }
        }
      }
    });
  }
  // 光栅化
  private rasterize(mode: DrawArraysMode) {
    this.rasterGroup.forEach((chunk) => {
      if (mode === DrawArraysMode.TRIANGLES || mode === DrawArraysMode.TRIANGLES_STRIP) {
        const vertex = chunk.slice(0, 3);
        const remaining = chunk.slice(3);
        vertex.forEach((payload) => {
          this.currentProgram?.execFragmentShader(payload);
          this.drawFragment(payload);
        });
        const varyings = {
          keys: Object.keys(vertex[0].__varying || {}),
          values: vertex.map((ver) => ver.__varying),
        };
        remaining.forEach((payload) => {
          const inter = interpolationTriangle(
            payload.zoomPosition,
            vertex[0].zoomPosition,
            vertex[1].zoomPosition,
            vertex[2].zoomPosition
          );
          const varying = {} as ShaderExecutorPayload['__varying'];
          varyings.keys.forEach((key) => {
            const values = varyings.values.map((temp) => temp?.[key]) as Float32Array[];
            const length = values[0].length;
            // 各分量求插值
            const tempArr = Array.from({ length }).map((_, index) => {
              return values.reduce((prev, current, currentIndex) => {
                return prev + current[index] * inter[currentIndex];
              }, 0);
            });
            varying && (varying[key] = new Float32Array(tempArr));
          });
          this.currentProgram?.execFragmentShader(payload, varying);
          this.drawFragment(payload);
        });
      }
    });
  }
  private drawFragment(payload: ShaderExecutorPayload) {
    const shaderPosition = payload?.zoomPosition;
    if (!shaderPosition) {
      return;
    }
    const color = payload?.FragColor;
    if (color) {
      this.fragmentBuffer.bufferColor(
        shaderPosition[0] + this.canvas.width / 2,
        shaderPosition[1] + this.canvas.height / 2,
        color
      );
    }
  }
  private render() {
    this.canvas.render(this.fragmentBuffer.toUint8ClampedArray());
  }
}

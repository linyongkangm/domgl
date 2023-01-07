import {
  ShaderType,
  VertexShaderExecutorPayload,
  FragmentShaderExecutorPayload,
  VertexShaderExecutorParams,
  Vec,
  FragmentShaderExecutorParams,
} from './interface';
import { Shader, VertexShader, FragmentShader } from './Shader';

export class Program {
  private willRasterizeFragmentPayload: {
    vertexShaderExecutorPayload?: VertexShaderExecutorPayload;
    fragmentShaderExecutorPayload?: FragmentShaderExecutorPayload;
  }[] = [];
  private vertexShader?: VertexShader;
  private fragmentShader?: FragmentShader;

  private attachVertexShader(shader: VertexShader) {
    this.vertexShader = shader;
  }

  private attachFragmentShader(shader: FragmentShader) {
    this.fragmentShader = shader;
  }
  public attachShader(shader: Shader) {
    if (shader.type === ShaderType.VERTEX_SHADER) {
      this.attachVertexShader(shader as VertexShader);
    } else if (shader.type === ShaderType.FRAGMENT_SHADER) {
      this.attachFragmentShader(shader as FragmentShader);
    }
  }
  public resetWillRasterizeFragmentPayload() {
    this.willRasterizeFragmentPayload = [];
  }
  public execvVertexShader() {
    const payload: VertexShaderExecutorPayload = {
      PointSize: 1,
    };
    this.vertexShader?.executor?.(payload, this.vertexParams);
    if (payload.Position) {
      this.willRasterizeFragmentPayload.push({
        vertexShaderExecutorPayload: payload,
      });
    }
  }
  public execFragmentShader(draw: (payload: Program['willRasterizeFragmentPayload'][0]) => void) {
    this.willRasterizeFragmentPayload.forEach((fragment) => {
      const payload: FragmentShaderExecutorPayload = {};
      this?.fragmentShader?.executor?.(payload, this.fragmentParams);
      fragment.fragmentShaderExecutorPayload = payload;
      draw(fragment);
    });
  }
  private uniformParams: VertexShaderExecutorParams['uniform'] = {};
  private vertexParams: VertexShaderExecutorParams = {
    attribute: {},
    uniform: this.uniformParams,
  };
  private fragmentParams: FragmentShaderExecutorParams = {
    uniform: this.uniformParams,
  };
  public getAttribLocation(name: string) {
    return (vec: Vec) => {
      this.vertexParams.attribute[name] = vec;
    };
  }
  public getUniformLocation(name: string) {
    return (vec: Vec) => {
      this.uniformParams[name] = vec;
    };
  }
}

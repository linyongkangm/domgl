import { AttribLocation } from './AttribLocation';
import {
  ShaderType,
  VertexShaderExecutorPayload,
  FragmentShaderExecutorPayload,
  VertexShaderExecutorParams,
  Vec,
  FragmentShaderExecutorParams,
  Color,
  ShaderPosition,
} from './interface';
import { Shader, VertexShader, FragmentShader } from './Shader';

export class Program {
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
  public execvVertexShader(payload: VertexShaderExecutorPayload) {
    Object.entries(this.vertexParams.bindAttribLocation).forEach(([key, location]) => {
      const data = location?.getCurrentData?.();
      if (data) {
        this.vertexParams.attribute[key] = data;
      }
    });
    this.vertexShader?.executor?.(payload, {
      ...this.vertexParams,
      varying: payload.__varying as any,
    });
    if (payload.Position) {
      return payload;
    }
  }
  public execFragmentShader(
    payload: VertexShaderExecutorPayload & FragmentShaderExecutorPayload,
    varying?: FragmentShaderExecutorParams['varying']
  ) {
    this?.fragmentShader?.executor?.(payload, {
      ...this.fragmentParams,
      varying: varying || payload.__varying || {},
    });
    return payload;
  }

  private vertexParams: VertexShaderExecutorParams & { bindAttribLocation: { [name: string]: AttribLocation } } = {
    attribute: {},
    uniform: {},
    bindAttribLocation: {},
    varying: {},
  };
  private fragmentParams: FragmentShaderExecutorParams = {
    uniform: this.vertexParams.uniform,
    varying: {},
  };
  public getAttribLocation(name: string) {
    const location = new AttribLocation();
    this.vertexParams.bindAttribLocation[name] = location;
    return location.setData.bind(location);
  }
  public getUniformLocation(name: string) {
    return (vec: Vec) => {
      this.vertexParams.uniform[name] = vec;
    };
  }
}

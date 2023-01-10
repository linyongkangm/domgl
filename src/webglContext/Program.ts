import { AttribLocation } from './AttribLocation';
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
  public execvVertexShader() {
    const payload: VertexShaderExecutorPayload = {
      PointSize: 1,
    };
    const attribute: VertexShaderExecutorParams['attribute'] = {};
    Object.entries(this.vertexParams.attribute).forEach(([key, location]) => {
      const data = location?.getCurrentData?.();
      if (data) {
        attribute[key] = data;
      }
    });
    this.vertexShader?.executor?.(payload, { attribute, uniform: this.vertexParams.uniform });
    if (payload.Position) {
      return payload;
    }
  }
  public execFragmentShader(payload: VertexShaderExecutorPayload & FragmentShaderExecutorPayload) {
    this?.fragmentShader?.executor?.(payload, this.fragmentParams);
    return payload;
  }
  private uniformParams: VertexShaderExecutorParams['uniform'] = {};
  private vertexParams = {
    attribute: {} as { [key: string]: AttribLocation },
    uniform: this.uniformParams,
  };
  private fragmentParams: FragmentShaderExecutorParams = {
    uniform: this.uniformParams,
  };
  public getAttribLocation(name: string) {
    const location = new AttribLocation();
    this.vertexParams.attribute[name] = location;
    return location.setData.bind(location);
  }
  public getUniformLocation(name: string) {
    return (vec: Vec) => {
      this.uniformParams[name] = vec;
    };
  }
}

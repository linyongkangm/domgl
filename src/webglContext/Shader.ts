import { ShaderType, ShaderExecutor, VertexShaderExecutor, FragmentShaderExecutor } from './interface';

export abstract class Shader {
  public static create(type: ShaderType) {
    if (type === ShaderType.VERTEX_SHADER) {
      return new VertexShader();
    } else if (type === ShaderType.FRAGMENT_SHADER) {
      return new FragmentShader();
    }
    throw new Error('not type');
  }
  public readonly type: ShaderType = ShaderType.VERTEX_SHADER;
  public executor?: ShaderExecutor;
  public registerExecutor(executor: ShaderExecutor) {
    this.executor = executor;
  }
  public compileExecutor() {
    if (!this.executor) {
      throw new Error('not executor');
    }
  }
}

export class VertexShader extends Shader {
  public readonly type = ShaderType.VERTEX_SHADER;
  public declare executor?: VertexShaderExecutor;
  public registerExecutor(executor: VertexShaderExecutor) {
    super.registerExecutor(executor);
  }
}

export class FragmentShader extends Shader {
  public readonly type = ShaderType.FRAGMENT_SHADER;
  public declare executor?: FragmentShaderExecutor;
  public registerExecutor(executor: FragmentShaderExecutor) {
    super.registerExecutor(executor);
  }
}

import { ShaderType } from './interface';
import { Shader, VertexShader, FragmentShader } from './Shader';

export class Program {
  public vertexShader?: VertexShader;
  public fragmentShader?: FragmentShader;
  public attachShader(shader: Shader) {
    if (shader.type === ShaderType.VERTEX_SHADER) {
      this.attachVertexShader(shader as VertexShader);
    } else if (shader.type === ShaderType.FRAGMENT_SHADER) {
      this.attachFragmentShader(shader as FragmentShader);
    }
  }

  private attachVertexShader(shader: VertexShader) {
    this.vertexShader = shader;
  }

  private attachFragmentShader(shader: FragmentShader) {
    this.fragmentShader = shader;
  }
}

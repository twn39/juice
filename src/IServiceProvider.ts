import {Container} from "./index";

export interface IServiceProvider {
  register(container: Container): Container;
}

import {ID} from "./index";

export const TokenMetaData = 'di:token';

export function Injectable(token?: ID): ClassDecorator {
  return (target) => {
    if (token != null) {
      Reflect.defineMetadata(TokenMetaData, token, target);
    }
  }
}

export function Inject(token: ID) {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const params = Reflect.getMetadata('design:paramtypes', target);
    Reflect.defineMetadata(TokenMetaData, token, params[parameterIndex]);
  }
}

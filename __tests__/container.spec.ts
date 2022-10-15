import {describe, expect, test} from '@jest/globals';
import {Container} from "../src";


describe('Container', () => {
  test('create an empty container', () => {
    const container = new Container();
    expect(container).toBeInstanceOf(Container);
    expect(container.size()).toBe(0);
  });

  test('create the container with construct', () => {
    const container = new Container({
      config: {
        app: 'tsdi',
        env: 'develop',
      },
      LOGGER: () => {
        return (message: string) => console.log(message);
      }
    });
    expect(container).toBeInstanceOf(Container);
    expect(container.size()).toBe(2);
    const config = container.get<Record<string, any>>('config');
    expect(config.env).toBe('develop');
    const logger = container.get('LOGGER');
    expect(typeof logger).toBe('function');
    const logger2 = container.get('LOGGER');
    expect(logger).toBe(logger2);
  });
});

import {describe, expect, test} from '@jest/globals';
import {Container, FrozenServiceError, UnknownIdentifierError} from "../src";

class Student {
  public name: string

  constructor(name = "") {
    this.name = name;
  }

  setName(name: string) {
    this.name = name;
  }
}

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
    expect(logger).toStrictEqual(logger2);
  });

  test('add service to container', () => {
    const container = new Container();
    const fn = () => container.get('SESSION');
    expect(fn).toThrowError(UnknownIdentifierError);
    expect(container.has('SESSION')).toBeFalsy();
    container.set('LOGGER', () => (msg: string) => `log: ${msg}`);
    expect(container.has('LOGGER')).toBeTruthy();
    const logger: Function = container.get('LOGGER');
    expect(logger('hello')).toBe('log: hello');
    expect(() => container.set('LOGGER', () => console.log)).toThrowError(FrozenServiceError);
  })

  test('add factory to container', () => {
    const container = new Container();
    container.factory<Student>('STUDENT', () => new Student());
    const kevin = container.get<Student>('STUDENT');
    const tom = container.get<Student>('STUDENT');

    expect(kevin).toBeInstanceOf(Student);
    expect(tom).toBeInstanceOf(Student);
    expect(kevin).not.toBe(tom);
  })

  test('extend the service', () => {
    const container = new Container();
    expect(() => container.extend<Student>('STUDENT', (student, container) => new Student())).toThrowError(UnknownIdentifierError)
    container.set<Student>('STUDENT', () => new Student());
    container.extend<Student>('STUDENT', (student, container) => {
      student.setName("Kevin");
      return student;
    })

    const student = container.get<Student>('STUDENT');
    expect(student.name).toBe('Kevin');
    // can not extend service when the service is invoked
    const fn = () => container.extend<Student>('STUDENT', (student, container) => {
      student.setName('Tom');
      return student;
    })
    expect(fn).toThrowError(FrozenServiceError);
  })
});

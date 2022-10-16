export interface IServiceProvider {
  register(container: Container): Container;
}

export type ID = string | symbol;

export type ServiceCallable<T> = (c: Container) => T;

export class FrozenServiceError extends Error {}

export class UnknownIdentifierError extends Error {}

export class ExpectedCallableError extends Error {}

export class InvalidServiceIdentifierError extends Error {}

export class ProtectedServiceError extends Error {}

/**
 * Main di container class, make a container:
 *
 * ```ts
 * const container = new Container();
 * ```
 * or
 *
 * ```ts
 * const container = new Container({
 *   config: {
 *     env: "develop"
 *   },
 *   LOGGER: (msg) => console.log(msg)
 * })
 * ```
 */
export class Container {
  private values;
  private factories;
  private protected;
  private frozen: Set<any>;
  private _raw: Map<ID, any>;
  private _keys: Set<ID>;

  /**
   * @param values
   */
  constructor(values: Record<ID, any> = []) {
    this.values = new Map();
    this.factories = new Set();
    this.protected = new Set();
    this.frozen = new Set();
    this._raw = new Map();
    this._keys = new Set();

    for (let key in values) {
      this.set(key, values[key]);
    }
  }

  /**
   * set service by identifier
   * @param id
   * @param value
   */
  public set<T>(id: ID, value: T | ServiceCallable<T>) {
    if (this.frozen.has(id)) {
      throw new FrozenServiceError(`The service: ${String(id)} is frozen.`);
    }
    this.values.set(id, value);
    this._keys.add(id);
  }

  /**
   * get service by identifier
   * @param id
   */
  public get<T>(id: ID): T {
    if (!this._keys.has(id)) {
      throw new UnknownIdentifierError(`Unknown service: ${String(id)}.`);
    }
    if (this._raw.has(id) || typeof this.values.get(id) !== "function") {
      return this.values.get(id);
    }

    if (this.factories.has(this.values.get(id))) {
      const factory = this.values.get(id);
      return factory(this);
    }

    const raw = this.values.get(id);
    const instance = raw(this);
    this.values.set(id, instance);
    this._raw.set(id, raw);
    this.frozen.add(id);

    return instance;
  }

  /**
   * @param id
   */
  public has(id: ID): boolean {
    return this._keys.has(id);
  }

  public keys() {
    return this.values.keys();
  }

  public size(): number {
    return this.values.size;
  }

  /**
   * @param id
   */
  public raw<T>(id: ID): T | ServiceCallable<T> {
    if (!this._keys.has(id)) {
      throw new UnknownIdentifierError(
        `Unknown service identifier: ${String(id)}`
      );
    }
    if (this._raw.has(id)) {
      return this._raw.get(id);
    }

    return this.values.get(id);
  }

  /**
   * @param id
   */
  public delete(id: ID) {
    if (this._keys.has(id)) {
      const fn = this.values.get(id);
      if (typeof fn === "function") {
        this.factories.delete(fn);
        this.protected.delete(fn);
      }
      this.values.delete(id);
      this.frozen.delete(id);
      this._raw.delete(id);
      this._keys.delete(id);
    }
  }

  /**
   * set factory service
   * @param id
   * @param callable
   */
  public factory<T>(id: ID, callable: ServiceCallable<T>) {
    if (typeof callable !== "function") {
      throw new ExpectedCallableError("Service definition is not callable.");
    }
    this.factories.add(callable);
    this.set(id, callable);
  }

  /**
   * this service can not being extended
   * @param id
   * @param callable
   */
  public protect<T>(id: ID, callable: ServiceCallable<T>) {
    if (typeof callable !== "function") {
      throw new ExpectedCallableError("Service definition is not callable.");
    }
    this.protected.add(callable);
    this.set(id, callable);
  }

  /**
   * extend the service
   * @param id
   * @param callable
   */
  public extend<T>(id: ID, callable: (instance: T, c: Container) => any) {
    if (!this._keys.has(id)) {
      throw new UnknownIdentifierError(`Unknown service: ${String(id)}`);
    }
    if (this.frozen.has(id)) {
      throw new FrozenServiceError(`Service: ${String(id)} is frozen.`);
    }
    if (typeof this.values.get(id) !== "function") {
      throw new InvalidServiceIdentifierError(
        `Service identifier: ${String(id)} is invalid.`
      );
    }

    if (this.protected.has(this.values.get(id))) {
      throw new ProtectedServiceError(`Service: ${String(id)} is protected.`);
    }
    if (typeof callable !== "function") {
      throw new ExpectedCallableError(`Expect callback function.`);
    }

    const fn = this.values.get(id);
    const extendedFn = (c: Container) => {
      return callable(fn(c), c);
    };

    if (this.factories.has(fn)) {
      this.factories.delete(fn);
      this.factories.add(extendedFn);
    }

    return this.set(id, extendedFn);
  }

  /**
   * register a service provider
   * @param provider
   */
  public register(provider: IServiceProvider) {
    provider.register(this);
    return this;
  }
}

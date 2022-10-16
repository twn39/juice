
Juice is a small Dependency Injection Container for typescript and javascript.

Installation
------------

Before using Juice in your project, add it to your ``package.json`` file:

    $ pnpm i @twn39/juice

Usage
-----

Creating a container is a matter of creating a ``Container`` instance:

```ts
import {Container} from '@twn39@juice'

const container = new Container();
```

As many other dependency injection containers, Juice manages two different
kind of data: **services** and **parameters**.

### Defining Services

A service is an object that does something as part of a larger system. Examples
of services: a database connection, a templating engine, or a mailer. Almost
any **global** object can be a service.

Services are defined by **anonymous functions** that return an instance of an
object:

```ts
  container.set('LOGGER', (msg: string) => console.log(msg))
```

Notice that the anonymous function has access to the current container
instance, allowing references to other services or parameters.

As objects are only created when you get them, the order of the definitions
does not matter.

Using the defined services is also very easy:

```ts
const logger = container.get('LOGGER');
```


### Defining Factory Services

By default, each time you get a service, Pimple returns the **same instance**
of it. If you want a different instance to be returned for all calls, wrap your
anonymous function with the ``factory()`` method

```ts
import {Container} from "@twn39/juice";

container.factory("SESSION", (c: Container) => new Session());

```

Now, each call to `container.get('SESSION')` returns a new instance of the
session.


### Protecting Parameters

Because Juice sees anonymous functions as service definitions, you need to
wrap anonymous functions with the ``protect()`` method to store them as
parameters:

```ts
container.protect('RANDOM', () => rand())
```

### Modifying Services after Definition

In some cases you may want to modify a service definition after it has been
defined. You can use the ``extend()`` method to define additional code to be
run on your service just after it is created:

```ts
import {Container} from "@twn39/juice";

container.set('STORAGE', () => localStorage);
container.extend('STORAGE', (storage: LocalStorage, c: Container) => {
    return sessionStorage;
})
```

The first argument is the name of the service to extend, the second a function
that gets access to the object instance and the container.

### Extending a Container

If you use the same libraries over and over, you might want to reuse some
services from one project to the next one; package your services into a
**provider** by implementing ``IServiceProvider``:

```ts

class FooProvider implements IServiceProvider {
  register(c: Container) {
      // register some services
  }
}
```

Then, register the provider on a Container:

```ts
container.register(new FooProvider());
```

### Fetching the Service Creation Function

When you access an object, Pimple automatically calls the anonymous function
that you defined, which creates the service object for you. If you want to get
raw access to this function, you can use the ``raw()`` method:

```ts
container.set('SESSION', () => new Session());
const fn = container.raw('SESSION');
```

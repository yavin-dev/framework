/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

type Services = 'navi-dimension' | 'navi-facts' | 'navi-metadata' | 'navi-formatter';
type LookupType = 'service';
export interface Injector {
  lookup<T extends Services>(type: LookupType, name: T): any;
}

const INJECTOR = Symbol.for('injector');

export default class NativeWithCreate {
  declare [INJECTOR]?: Injector;
  constructor(injector: Injector, args: object) {
    this[INJECTOR] = injector;
    Object.assign(this, args);
  }
}

function createGetter(
  _target: NativeWithCreate,
  _key: string,
  _descriptor: unknown,
  dependencyId: Services
): PropertyDescriptor {
  return {
    enumerable: false,
    get(this: NativeWithCreate): unknown {
      return this[INJECTOR]?.lookup('service', dependencyId);
    },
    set(value: unknown) {
      Object.defineProperty(this, _key, { value });
    },
  };
}

export function ClientService<T extends NativeWithCreate, S extends Services>(dependencyId: S): Function {
  return function getter(...args: any[]) {
    return createGetter(...(args as [T, string, any]), dependencyId);
  };
}

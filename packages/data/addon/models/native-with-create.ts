/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type ClientServices = 'navi-dimension' | 'navi-facts' | 'navi-metadata' | 'navi-formatter';
type LookupType = 'service';
export interface Injector {
  lookup<T extends ClientServices>(type: LookupType, name: T): any;
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
  key: string,
  _descriptor: unknown,
  dependencyId: ClientServices
): PropertyDescriptor {
  return {
    enumerable: false,
    get(this: NativeWithCreate): unknown {
      return this[INJECTOR]?.lookup('service', dependencyId);
    },
    set(value: unknown) {
      Object.defineProperty(this, key, { value });
    },
  };
}

export function ClientService<T extends NativeWithCreate, S extends ClientServices>(dependencyId: S): Function {
  return function getter(...args: any[]) {
    return createGetter(...(args as [T, string, any]), dependencyId);
  };
}

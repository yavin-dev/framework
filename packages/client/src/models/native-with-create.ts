/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ClientConfig } from '../config/datasources.js';
import type ServiceRegistry from '../services/interfaces/registry.js';

export type ClientServices = keyof ServiceRegistry;
export type LookupType = 'config' | 'service';
export interface Injector {
  lookup(type: 'config'): ClientConfig;
  lookup<T extends ClientServices>(type: 'service', name: T): ServiceRegistry[T];
  lookup<T extends ClientServices>(type: LookupType, name?: T): ServiceRegistry[T] | ClientConfig;
}

const INJECTOR = Symbol.for('injector');

export default class NativeWithCreate {
  declare [INJECTOR]?: Injector;
  constructor(injector: Injector, args?: object) {
    this[INJECTOR] = injector;
    Object.assign(this, args);
  }
}

function createGetter(
  _target: NativeWithCreate,
  key: string,
  _descriptor: unknown,
  params: Parameters<Injector['lookup']>
): PropertyDescriptor {
  return {
    enumerable: false,
    get(this: NativeWithCreate): unknown {
      return this[INJECTOR]?.lookup(...params);
    },
    set(value: unknown) {
      Object.defineProperty(this, key, { value });
    },
  };
}

export function Config<T extends NativeWithCreate>(): (...args: any[]) => void {
  return function getter(...args: any[]) {
    return createGetter(...(args as [T, string, any]), ['config']);
  };
}

export function ClientService<T extends NativeWithCreate, S extends ClientServices>(
  dependencyId: S
): (...args: any[]) => void {
  return function getter(...args: any[]) {
    return createGetter(...(args as [T, string, any]), ['service', dependencyId]);
  };
}

export function getInjector<T extends NativeWithCreate>(obj: T) {
  return obj[INJECTOR];
}

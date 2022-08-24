/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataSourcePluginConfig } from '../config/datasource-plugins.js';
import type { ClientConfig } from '../config/datasources.js';
import type ServiceRegistry from '../services/interfaces/registry.js';

export interface ConfigRegistry {
  client: ClientConfig;
  plugin: DataSourcePluginConfig;
}
export type Configs = keyof ConfigRegistry;
export type ClientServices = keyof ServiceRegistry;
export type LookupType = 'config' | 'service';

type LookupRegistry = { config: ConfigRegistry; service: ServiceRegistry };
export interface Injector {
  lookup<C extends Configs>(type: 'config', name: C): ConfigRegistry[C];
  lookup<T extends ClientServices>(type: 'service', name: T): ServiceRegistry[T];
  lookup<L extends LookupType>(type: L, name: string): LookupRegistry[L][keyof LookupRegistry[L]];
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
  callback: (injector: Injector) => unknown
): PropertyDescriptor {
  return {
    enumerable: false,
    get(this: NativeWithCreate): unknown {
      const injector = this[INJECTOR];
      return injector ? callback(injector) : undefined;
    },
    set(value: unknown) {
      Object.defineProperty(this, key, { value });
    },
  };
}

function createDecorator<T extends NativeWithCreate>(
  callback: (injector: Injector) => unknown
): (...args: any[]) => void {
  return function getter(...args: any[]) {
    return createGetter(...(args as [T, string, any]), callback);
  };
}

export function Config<C extends Configs>(config: C) {
  return createDecorator((injector: Injector) => injector.lookup('config', config));
}

export function ClientService<S extends ClientServices>(dependencyId: S) {
  return createDecorator((injector: Injector) => injector.lookup('service', dependencyId));
}

export function Logger(namespace: string) {
  return createDecorator((injector: Injector) => injector.lookup('service', 'logger').extend(namespace));
}

export function getInjector(obj: any): Injector {
  return obj[INJECTOR];
}

export function setInjector(obj: any, injector: Injector) {
  obj[INJECTOR] = injector;
}

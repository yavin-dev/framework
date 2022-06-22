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

export function Config<T extends NativeWithCreate, C extends Configs>(config: C): (...args: any[]) => void {
  return function getter(...args: any[]) {
    return createGetter(...(args as [T, string, any]), ['config', config]);
  };
}

export function ClientService<T extends NativeWithCreate, S extends ClientServices>(
  dependencyId: S
): (...args: any[]) => void {
  return function getter(...args: any[]) {
    return createGetter(...(args as [T, string, any]), ['service', dependencyId]);
  };
}

export function getInjector(obj: any): Injector {
  return obj[INJECTOR];
}

export function setInjector(obj: any, injector: Injector) {
  obj[INJECTOR] = injector;
}

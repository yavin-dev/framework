/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { getOwner } from '@ember/application';
import { omit } from 'lodash-es';

type PayloadType<T> = T extends new (...args: infer U) => unknown ? U[1] : never;

type InstanceType<T extends new (...args: unknown[]) => unknown> = T extends new (...args: unknown[]) => infer R
  ? R
  : unknown;

export default class NativeWithCreate {
  constructor(_owner: unknown, args: object) {
    Object.assign(this, args);
  }

  static create<T extends typeof NativeWithCreate>(this: T, args: PayloadType<T>): InstanceType<T> {
    const owner = getOwner(args);
    const ignoreKey = Object.keys(args).find((k) => k.startsWith('__LEGACY_OWNER__')) ?? '';
    const rest = omit(args, ignoreKey);
    // TODO: is this needed?
    return new this(owner, rest) as InstanceType<T>;
  }
}

export interface Factory<T extends NativeWithCreate> {
  class: T;
  create<C extends typeof NativeWithCreate & T>(args?: PayloadType<T>): InstanceType<C>;
}

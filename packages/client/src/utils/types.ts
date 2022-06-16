/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

export type ReturnTypesOfObject<Interface extends Record<keyof Interface, any>> = {
  [k in keyof Interface]: Interface[k] extends (...args: any[]) => any
    ? ReturnType<Interface[k]>
    : ReturnTypesOfObject<Interface[k]>;
};

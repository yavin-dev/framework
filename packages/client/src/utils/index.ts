/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

export function isPresent<T>(t: T | undefined | null | void): t is T {
  return t !== undefined && t !== null;
}

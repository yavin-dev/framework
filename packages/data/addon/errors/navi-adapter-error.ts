/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
function isPresent<T>(t: T | undefined | null | void): t is T {
  return t !== undefined && t !== null;
}

type JSONApiError = {
  id?: string;
  links?: Record<string, string>;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  meta?: Record<string, string>;
};

export type NaviErrorDetails = JSONApiError;

export default class NaviAdapterError extends Error {
  errors: NaviErrorDetails[];
  rootCause: unknown;

  constructor(message: string, errors: NaviErrorDetails[] = [], rootCause?: unknown) {
    super(message);
    this.errors = errors;
    this.rootCause = rootCause;
  }

  get details(): string[] {
    return this.errors.map((e) => e.detail).filter(isPresent);
  }

  toString() {
    return `${super.toString()}. Root cause: ${this.rootCause}`;
  }
}

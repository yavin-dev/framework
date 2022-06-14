/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

export class FetchError extends Error {
  name = 'FetchError';
  status: number;
  payload: Record<string, unknown> | string;
  constructor(status: number, payload: Record<string, unknown> | string) {
    super();
    this.status = status;
    this.payload = payload;
  }
}

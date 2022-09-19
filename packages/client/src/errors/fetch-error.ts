/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

export class FetchError extends Error {
  name = 'FetchError';
  url: string;
  status: number;
  payload: Record<string, unknown> | string;
  constructor(url: string, status: number, payload: Record<string, unknown> | string) {
    super();
    this.url = url;
    this.status = status;
    this.payload = payload;
  }

  toString() {
    return `${this.name}: HTTP${this.status} - ${JSON.stringify(this.payload)} while fetching ${this.url}`;
  }
}

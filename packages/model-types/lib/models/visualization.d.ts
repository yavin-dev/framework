/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
export type Visualization = {
  type: string;
  version: number;
  namespace: string;
  metadata: Record<string, unknown>;
};

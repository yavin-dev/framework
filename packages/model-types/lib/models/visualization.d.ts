/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
type BaseVisualization = {
  type: string;
  version: number;
  metadata: Record<string, unknown>;
};

export type Visualization =
  | BaseVisualization
  | (BaseVisualization & {
      namespace: string;
    });

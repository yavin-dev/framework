/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

export type JSONApiDef<
  T extends string = string,
  A extends Record<string, unknown> = {},
  R extends Record<string, BelongsTo<JSONApiDef> | HasMany<JSONApiDef>> = {}
> = {
  id: string;
  type: T;
  attributes: A;
  relationships: R;
};

export type BelongsTo<R extends JSONApiDef> = {
  data: { type: R['type']; id: R['id'] };
};
export type HasMany<R extends JSONApiDef> = {
  data: Array<{ type: R['type']; id: R['id'] }>;
};

export type JSONAPI<
  Def extends JSONApiDef | JSONApiDef[],
  Includes extends undefined | JSONApiDef = undefined
> = Includes extends JSONApiDef
  ? {
      data: Def;
      included: Includes[];
    }
  : {
      data: Def;
    };

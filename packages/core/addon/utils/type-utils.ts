/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';

/**
  Get the resolved type of an item.
  - If the item is a promise, the result will be the resolved value type
  - If the item is not a promise, the result will just be the type of the item
 */
export type Resolved<P> = P extends Promise<infer T> ? T : P;

/** Get the resolved model value from a route. */
export type ModelFrom<R extends Pick<Route, 'model'>> = Resolved<ReturnType<R['model']>>;

// Temporary definition for Transition from https://github.com/typed-ember/ember-cli-typescript/issues/790
// Definition sourced from https://docs.ember-cli-typescript.com/ember/routes
export type Transition = ReturnType<RouterService['transitionTo']>;

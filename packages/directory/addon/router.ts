/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import type RouterDSL from '@ember/routing/-private/router-dsl';

export function directoryRoutes(router: RouterDSL, nestedRoutes?: (this: RouterDSL) => void) {
  router.route('directory', function () {
    this.route('my-data');
    this.route('index', { path: '/' });
    nestedRoutes?.apply(this);
  });
}

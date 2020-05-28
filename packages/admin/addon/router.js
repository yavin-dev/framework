/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

export function adminRoutes(router, nestedRoutes = () => null) {
  router.route('admin', function() {
    this.route('roles');
    nestedRoutes.apply(this);
  });
}

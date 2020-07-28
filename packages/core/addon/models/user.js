/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
console.log('Model 1');
export default DS.Model.extend({
  reports: DS.hasMany('report', { async: true, inverse: 'author' }),
  favoriteReports: DS.hasMany('report', { async: true, inverse: null }),
  deliveryRules: DS.hasMany('deliveryRule', { async: true, inverse: 'owner' }),
  dashboards: DS.hasMany('dashboard', { async: true, inverse: 'author' }),
  favoriteDashboards: DS.hasMany('dashboard', { async: true, inverse: null }),
  roles: DS.hasMany('role', { async: true })
});

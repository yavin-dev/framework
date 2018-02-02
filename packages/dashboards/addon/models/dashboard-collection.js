/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';

export default DS.Model.extend({
  author:     DS.belongsTo('user', {async: true}),
  title:      DS.attr('string'),
  createdOn:  DS.attr('moment'),
  updatedOn:  DS.attr('moment'),
  dashboards: DS.hasMany('dashboard', { async: true })
});

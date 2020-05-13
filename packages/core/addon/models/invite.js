/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';

export default DS.Model.extend({
  code: DS.attr('string'),
  user: DS.belongsTo('user', { async: true }),
  assignedRoles: DS.hasMany('role', { async: true }),
  createdOn: DS.attr('moment'),
  modifiedOn: DS.attr('moment'),
  expiresOn: DS.attr('moment')
});

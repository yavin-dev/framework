/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';

export default DS.Model.extend({
  deliveryRules: DS.hasMany('deliveryRule', { async: true, inverse: 'deliveredItem' })
});

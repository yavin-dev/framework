/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import { A as arr } from '@ember/array';
import { computed, get } from '@ember/object';

export default DS.Model.extend({
  deliveryRules: DS.hasMany('deliveryRule', {
    async: true,
    inverse: 'deliveredItem'
  }),

  /**
   * @property {String} modelId - id or tempId of model
   */
  modelId: computed('id', 'tempId', function() {
    return get(this, 'id') || get(this, 'tempId');
  }),

  /**
   * @property {DS.Model} deliveryRuleForUser - delivery rule model
   */
  deliveryRuleForUser: computed('user', 'deliveryRules.[]', function() {
    let userId = get(get(this, 'user').getUser(), 'id');

    return DS.PromiseObject.create({
      promise: get(this, 'deliveryRules').then(rules =>
        arr(rules.filter(rule => rule.get('owner.id') === userId)).get('firstObject')
      ),
      reason: 'Unable to fetch delivery rule'
    });
  })
});

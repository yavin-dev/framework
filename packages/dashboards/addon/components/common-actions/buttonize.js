/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * buttonize component used to wrap dashboard actions executed in route object, within button .
 * eg: clone action executes by the route dashboards/:id/clone is wrapped around by this component
 * Usage:
 *   {{#common-actions/buttonize}}
 *      Inner template
 *   {{/common-actions/buttonize}}
 */
import Ember from 'ember';
import layout from '../../templates/components/common-actions/buttonize';

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['action'],
});

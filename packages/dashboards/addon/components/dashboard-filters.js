/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{dashboard-filters
 *     dashboard=dashboard
 *   }}
 */
import Component from '@ember/component';
import layout from '../templates/components/dashboard-filters';

export default Component.extend({
  layout,
  classNames: ['dashboard-filters'],
  classNameBindings: ['isCollapsed:collapsed:expanded'],

  /**
   * @property {Boolean} isCollapsed
   */
  isCollapsed: true
});

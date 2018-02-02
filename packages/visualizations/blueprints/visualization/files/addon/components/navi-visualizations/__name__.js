/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/<%= dasherizedModuleName %>
 *   model=model
 *   options=options
 *   incomingEvents=incomingEvents
 * }}
 */
import Ember from 'ember';
import layout from '../../templates/components/navi-visualizations/<%= dasherizedModuleName %>';

export default Ember.Component.extend({
  /**
   * @property {Object} layout
   */
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['<%= dasherizedModuleName %>-vis']
});

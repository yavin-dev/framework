/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{visualization-config/<%= dasherizedModuleName %>
 *    request=request
 *    response=response
 *    options=tableOptions
 *  }}
 */
import Ember from 'ember';
import layout from '../../templates/components/visualization-config/<%= dasherizedModuleName %>';

export default Ember.Component.extend({
  /**
   * @property {Object} layout
   */
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['<%= dasherizedModuleName %>-config']
});

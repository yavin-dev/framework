/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#chart-series-item
 *      seriesIndex=index
 *   }}
 *    //elements
 *   {{/chart-series-item}}
 */
import Ember from 'ember';
import layout from '../templates/components/chart-series-item';

export default Ember.Component.extend({
  layout,

  /**
   * @override
   * @property {String} tagName
   */
  tagName: 'ol',

  /**
   * @override
   * @property {Array} classNames - array of class names
   */
  classNames: ['chart-series-item'],

  /**
   * @property {Number} seriesIndex
   */
  seriesIndex: undefined
});

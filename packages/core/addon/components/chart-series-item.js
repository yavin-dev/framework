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
import Component from '@ember/component';
import layout from '../templates/components/chart-series-item';

export default Component.extend({
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

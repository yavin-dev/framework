/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Helper object for building request object used by fact service
 */
import Ember from 'ember';

export default Ember.Object.extend({

  /**
   * @property {Object} logicalTable - default value
   */
  logicalTable: {},

  /**
   * @property {Array} dimensions - default value
   */
  dimensions: [],

  /**
   * @property {Array} metrics - default value
   */
  metrics: [],

  /**
   * @property {Array} intervals - default value
   */
  intervals: [],

  /**
   * @property {Array} filters - default value
   */
  filters: [],

  /**
   * @property {Array} having - list of having clause objects
   */
  having: [],

  /**
   * @method copy
   * @param {...Object} arguments - objects with properties to merge into copy
   * @returns {Object} copy of request
   */
  copy() {
    return this.constructor.create(this, ...arguments);
  },

  /**
   * Adds to request property array in an immutable way
   *
   * @method push
   * @private
   * @param {String} property - key of array property to push to
   * @param {Array} values - new values
   * @returns {Object} copy of request with new values added
   */
  _push(property, values) {
    return this.copy({[property]: this[property].concat(values)});
  },

  /**
   * Maps an array of values into an array of objects
   * containing one property matching the value
   *
   * @method _wrap
   * @private
   * @param {String} key - property name of inner object
   * @param {Array} values - values to map into objects
   * @returns {Array} values mapped into array of objects
   */
  _wrap(key, values) {
    return values.map((value) => {
      return {
        [key]: value
      };
    });
  },

  /**
   * @method setLogicalTable
   * @param {String} table
   * @param {String} timeGrain
   * @returns {Object} copy of request with property updated
   */
  setLogicalTable(table, timeGrain) {
    return this.copy({logicalTable: {table, timeGrain}});
  },

  /**
   * @method addDimensions
   * @param {...String} dimensions - name of dimensions
   * @returns {Object} copy of request with property updated
   */
  addDimensions(...dimensions) {
    return this._push('dimensions', this._wrap('dimension', dimensions));
  },

  /**
   * @method setDimensions
   * @param {...String} dimensions - name of dimensions
   * @returns {Object} copy of request with property updated
   */
  setDimensions(...dimensions) {
    return this.copy({dimensions: this._wrap('dimension', dimensions)});
  },

  /**
   * @method addMetrics
   * @param {...String} metrics - name of metrics
   * @returns {Object} copy of request with property updated
   */
  addMetrics(...metrics) {
    return this._push('metrics', this._wrap('metric', metrics));
  },

  /**
   * @method setMetrics
   * @param {...String} metrics - name of metrics
   * @returns {Object} copy of request with property updated
   */
  setMetrics(...metrics) {
    return this.copy({metrics: this._wrap('metric', metrics)});
  },

  /**
   * @method addInterval
   * @param {String} start
   * @param {String} end
   * @returns {Object} copy of request with property updated
   */
  addInterval(start, end) {
    return this._push('intervals', [{start, end}]);
  },

  /**
   * @method addIntervals
   * @param {...Object} intervals - objects with start and end strings
   * @returns {Object} copy of request with property updated
   */
  addIntervals(...intervals) {
    return this._push('intervals', intervals);
  },

  /**
   * @method setIntervals
   * @param {...Object} intervals - objects with start and end strings
   * @returns {Object} copy of request with property updated
   */
  setIntervals(...intervals) {
    return this.copy({intervals});
  },

  /**
   * @method addFilter
   * @param {String} dimension
   * @param {String} operator
   * @param {Array} values
   * @returns {Object} copy of request with property updated
   */
  addFilter(dimension, operator, values) {
    return this._push('filters', [{dimension, operator, values}]);
  },

  /**
   * @method addFilters
   * @param {...Object} filters - objects with dimension, operator, and values
   * @returns {Object} copy of request with property updated
   */
  addFilters(...filters) {
    return this._push('filters', filters);
  },

  /**
   * @method setFilters
   * @param {...Object} filters - objects with dimension, operator, and values
   * @returns {Object} copy of request with property updated
   */
  setFilters(...filters) {
    return this.copy({filters});
  },

  /**
   * @method addHaving
   * @param {String} metric
   * @param {String} operator
   * @param {Number} value
   * @returns {Object} copy of request with property updated
   */
  addHaving(metric, operator, value) {
    return this._push('having', [{metric, operator, values: [value]}]);
  },

  /**
   * @method addHavings
   * @param {...Object} having - objects with metric, operator, and value
   * @returns {Object} copy of request with property updated
   */
  addHavings(...having) {
    return this._push('having', having);
  },

  /**
   * @method setHavings
   * @param {...Object} having - objects with metric, operator, and value
   * @returns {Object} copy of request with property updated
   */
  setHavings(...having) {
    return this.copy({having});
  }

});

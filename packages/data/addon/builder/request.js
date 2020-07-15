/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Helper object for building request object used by fact service
 */
import EmberObject from '@ember/object';
import { A as arr } from '@ember/array';

export default class Request extends EmberObject {
  /**
   * @property {Object} logicalTable - default value
   */
  logicalTable = {};

  /**
   * @property {Array} dimensions - default value
   */
  dimensions = arr([]);

  /**
   * @property {Array} metrics - default value
   */
  metrics = [];

  /**
   * @property {Array} intervals - default value
   */
  intervals = [];

  /**
   * @property {Array} filters - default value
   */
  filters = [];

  /**
   * @property {Array} having - list of having clause objects
   */
  having = [];

  /**
   * @property {Array} sort - list of sort objects
   */
  sort = [];

  /**
   * @method copy
   * @param {...Object} arguments - objects with properties to merge into copy
   * @returns {Object} copy of request
   */
  copy() {
    return this.constructor.create(this);
  }

  /**
   * Adds to request property array in an immutable way
   *
   * @method push
   * @private
   * @param {String} property - key of array property to push to
   * @param {Array} values - new values
   * @returns {Object} copy of request with new values added
   */
  _immutablePush(property, values) {
    let requestCopy = this.copy();
    requestCopy.set(property, this[property].concat(values));
    return requestCopy;
  }

  /**
   * Sets a request property in an immutable way
   *
   * @method push
   * @private
   * @param {String} property - key of array property to push to
   * @param {Array|Object} value - new value
   * @returns {Object} copy of request with the new value added
   */
  _immutableSet(property, value) {
    let requestCopy = this.copy();
    requestCopy.set(property, value);
    return requestCopy;
  }

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
    return values.map(value => ({ [key]: value }));
  }

  /**
   * @method setLogicalTable
   * @param {String} table
   * @param {String} timeGrain
   * @returns {Object} copy of request with property updated
   */
  setLogicalTable(table, timeGrain) {
    return this._immutableSet('logicalTable', { table, timeGrain });
  }

  /**
   * @method addDimensions
   * @param {...String} dimensions - name of dimensions
   * @returns {Object} copy of request with property updated
   */
  addDimensions(...dimensions) {
    return this._immutablePush('dimensions', this._wrap('dimension', dimensions));
  }

  /**
   * @method setDimensions
   * @param {...String} dimensions - name of dimensions
   * @returns {Object} copy of request with property updated
   */
  setDimensions(...dimensions) {
    return this._immutableSet('dimensions', this._wrap('dimension', dimensions));
  }

  /**
   * @method addMetrics
   * @param {...Object} metrics - metric objects with name and parameters
   * @returns {Object} copy of request with property updated
   */
  addMetrics(...metrics) {
    return this._immutablePush('metrics', metrics);
  }

  /**
   * @method setMetrics
   * @param {...Object} metrics - metric objects with name and parameters
   * @returns {Object} copy of request with property updated
   */
  setMetrics(...metrics) {
    return this._immutableSet('metrics', metrics);
  }

  /**
   * @method setMetricsByName
   * @param {...String} metrics - names of metrics
   * @returns {Object} copy of request with property updated
   */
  setMetricsByName(...metrics) {
    return this._immutableSet('metrics', this._wrap('metric', metrics));
  }

  /**
   * @method addInterval
   * @param {String} start
   * @param {String} end
   * @returns {Object} copy of request with property updated
   */
  addInterval(start, end) {
    return this._immutablePush('intervals', [{ start, end }]);
  }

  /**
   * @method addIntervals
   * @param {...Object} intervals - objects with start and end strings
   * @returns {Object} copy of request with property updated
   */
  addIntervals(...intervals) {
    return this._immutablePush('intervals', intervals);
  }

  /**
   * @method setIntervals
   * @param {...Object} intervals - objects with start and end strings
   * @returns {Object} copy of request with property updated
   */
  setIntervals(...intervals) {
    return this._immutableSet('intervals', intervals);
  }

  /**
   * @method addFilter
   * @param {String} dimension
   * @param {String} operator
   * @param {Array} values
   * @returns {Object} copy of request with property updated
   */
  addFilter(dimension, operator, values) {
    return this._immutablePush('filters', [{ dimension, operator, values }]);
  }

  /**
   * @method addFilters
   * @param {...Object} filters - objects with dimension, operator, and values
   * @returns {Object} copy of request with property updated
   */
  addFilters(...filters) {
    return this._immutablePush('filters', filters);
  }

  /**
   * @method setFilters
   * @param {...Object} filters - objects with dimension, operator, and values
   * @returns {Object} copy of request with property updated
   */
  setFilters(...filters) {
    return this._immutableSet('filters', filters);
  }

  /**
   * @method addHaving
   * @param {String} metric
   * @param {String} operator
   * @param {Number} value
   * @returns {Object} copy of request with property updated
   */
  addHaving(metric, operator, value) {
    return this._immutablePush('having', [{ metric, operator, values: [value] }]);
  }

  /**
   * @method addHavings
   * @param {...Object} having - objects with metric, operator, and value
   * @returns {Object} copy of request with property updated
   */
  addHavings(...having) {
    return this._immutablePush('having', having);
  }

  /**
   * @method setHavings
   * @param {...Object} having - objects with metric, operator, and value
   * @returns {Object} copy of request with property updated
   */
  setHavings(...having) {
    return this._immutableSet('having', having);
  }

  /**
   * @method addSort
   * @param {String} metric
   * @param {String} direction
   * @returns {Object} copy of request with property updated
   */
  addSort(metric, direction = 'desc') {
    return this._immutablePush('sort', [{ metric, direction }]);
  }

  /**
   * @method addSorts
   * @param {...Object} sort - objects with metric, direction
   * @returns {Object} copy of request with property updated
   */
  addSorts(...sorts) {
    return this._immutablePush('sort', sorts);
  }

  /**
   * @method setSorts
   * @param {...Object} sorts - objects with metric, and direction
   * @returns {Object} copy of request with property updated
   */
  setSorts(...sorts) {
    return this._immutableSet('sort', sorts);
  }
}

/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A model that holds a dimension value response.
 */
import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * Test to see if the dimension is considered the same as the other
   * @override
   * @param {BardDimension} other - another model to test for equality
   * @returns {Boolean} - if the object can be considered equal
   */
  isEqual(other) {
    const idField = this.constructor.identifierField || 'id';
    return this[idField] === other[idField];
  }
}).reopenClass({
  /**
   * @property {String} identifierField - name of the dimension identifier field
   */
  identifierField: 'id',

  /**
   * @property {String} dimensionName - name of the dimension
   */
  dimensionName: undefined,

  /**
   * @method toString
   * @returns {String} description of model factory
   */
  toString() {
    return `dimension model factory: ${this.dimensionName}`;
  }
});

/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A model that holds a dimension value response.
 */
import Ember from 'ember';

export default Ember.Object.extend({
  isEqual(other) {
    return this.id === other.id;
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

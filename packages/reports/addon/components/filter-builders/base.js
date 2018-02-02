/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base class for filter builders.
 */
import Ember from 'ember';
import layout from 'navi-reports/templates/components/filter-builders/base';

const { get } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['filter-builder'],

  /**
   * @property {Object} filter
   * @property {Object} filter.subject
   * @property {String} filter.subject.longName - display name for the filter subject
   * @property {Object} filter.operator - object with the same shape as the objects in `supportedOperators` property
   * @property {String} filter.operator.longName - display name for operator
   * @property {String} filter.operator.valuesComponent - name of component to use for selecting filter values
   * @property {Array} filter.values
   */
  filter: undefined,

  /**
   * @property {Array} supportedOperators - list of valid values for filter.operator
   */
  supportedOperators: [],

  actions: {
    /**
     * @action setOperator
     * @param {Object} operatorObject - a value from supportedOperators that should become the filter's operator
     */
    setOperator(operatorObject) {
      let changeSet = { operator: operatorObject.id };

      /*
       * Clear values in case they are incompatible with new operator,
       * unless operators share valuesComponent
       */
      if (get(this, 'filter.operator.valuesComponent') !== operatorObject.valuesComponent) {
        Ember.assign(changeSet, { values: [] });
      }

      this.attrs.onUpdateFilter(changeSet);
    }
  }
});

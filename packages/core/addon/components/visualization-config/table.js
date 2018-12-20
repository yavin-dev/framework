/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/table
 *    request=request
 *    response=response
 *    options=tableOptions
 *    onUpdateConfig=(action 'onUpdateConfig')
 * }}
 */

import Ember from 'ember';
import layout from '../../templates/components/visualization-config/table';

const { A: arr, computed, copy, get, inject } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['table-config'],

  /**
   * @property {Service} metadataService
   */
  metadataService: inject.service('bard-metadata'),

  /**
   * @property {Array} dimensions - dimension object metadata
   */
  dimensions: computed.mapBy('request.dimensions', 'dimension'),

  /**
   * @property {Array} subtotalDimensions - dimensions used to subtotal including dateTime
   */
  subtotalDimensions: computed('dimensions', function() {
    return [{ name: 'dateTime', longName: 'Date Time' }, ...get(this, 'dimensions')];
  }),

  /**
   * @property {Boolean} showDropdown - initial value to show subtotal dropdown
   */
  showSubtotalDropdown: computed.bool('options.showTotals.subtotal'),

  /**
   * @property {Object} selectedSubtotal - selected subtotal
   */
  selectedSubtotal: computed('options.showTotals.subtotal', function() {
    let subtotals = get(this, 'options.showTotals.subtotal');
    if (subtotals) {
      return arr(get(this, 'subtotalDimensions')).findBy('name', subtotals);
    }
  }),

  actions: {
    /**
     * @action onToggleGrandTotal
     * @param {Boolean} grandTotal
     * toggles flag in the visualization config
     */
    onToggleGrandTotal(grandTotal) {
      this.attrs.onUpdateConfig({ showTotals: { grandTotal } });
    },

    /**
     * @action onToggleSubtotal
     * @param {Boolean} val
     * sets the first dimension in request as subtotal in options when toggled on or
     * deletes the subtotal property from the config when subtotal is toggled off
     */
    onToggleSubtotal(val) {
      if (val) {
        let firstDim = get(this, 'subtotalDimensions')[0];
        this.attrs.onUpdateConfig({
          showTotals: { subtotal: get(firstDim, 'name') }
        });
      } else if (get(this, 'options.showTotals.subtotal')) {
        let newOptions = copy(get(this, 'options'));
        delete newOptions.showTotals.subtotal;
        this.attrs.onUpdateConfig(newOptions);
      }
    },

    /**
     * @action updateSubtotal
     * @param {Object} dimension - the dimension object chosen for subtotal
     * set the dimension name as a subtotal in the table config
     */
    updateSubtotal(dimension) {
      this.attrs.onUpdateConfig({ showTotals: { subtotal: dimension.name } });
    }
  }
});

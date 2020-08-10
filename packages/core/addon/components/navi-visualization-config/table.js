/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{navi-visualization-config/table
 *    request=request
 *    response=response
 *    options=tableOptions
 *    onUpdateConfig=(action 'onUpdateConfig')
 * }}
 */

import { inject as service } from '@ember/service';
import { mapBy } from '@ember/object/computed';
import Component from '@ember/component';
import { A as arr } from '@ember/array';
import { copy } from 'ember-copy';
import { computed, action } from '@ember/object';
import layout from '../../templates/components/navi-visualization-config/table';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class NaviVisualizationConfigTableComponent extends Component {
  /**
   * @property {Service} metadataService
   */
  @service('navi-metadata') metadataService;

  /**
   * @property {Array} dimensions - dimension object metadata
   */
  @mapBy('request.dimensions', 'dimension') dimensions;

  /**
   * @property {Boolean} showDropdown - initial value to show subtotal dropdown
   */
  _showSubtotalDropdown;

  /**
   * @property {Array} subtotalDimensions - dimensions used to subtotal including dateTime
   */
  @computed('dimensions')
  get subtotalDimensions() {
    return [{ id: 'dateTime', name: 'Date Time' }, ...this.dimensions];
  }

  /**
   * @override
   * @method didReceiveAttrs
   */
  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    this.set('_showSubtotalDropdown', !!this.options?.showTotals?.subtotal);
  }

  /**
   * @property {Object} selectedSubtotal - selected subtotal
   */
  @computed('options.showTotals.subtotal')
  get selectedSubtotal() {
    const subtotals = this.options?.showTotals?.subtotal;
    if (subtotals) {
      return arr(this.subtotalDimensions).findBy('id', subtotals);
    }
    return undefined;
  }

  /**
   * @action onToggleGrandTotal
   * @param {Boolean} grandTotal
   * toggles flag in the visualization config
   */
  @action
  onToggleGrandTotal(grandTotal) {
    this.onUpdateConfig({ showTotals: { grandTotal } });
  }

  /**
   * @action onToggleSubtotal
   * @param {Boolean} val
   * sets the first dimension in request as subtotal in options when toggled on or
   * deletes the subtotal property from the config when subtotal is toggled off
   */
  @action
  onToggleSubtotal(val) {
    if (val) {
      const firstDim = this.subtotalDimensions[0];
      this.onUpdateConfig({
        showTotals: { subtotal: firstDim.id }
      });
    } else if (this.options?.showTotals?.subtotal) {
      const newOptions = copy(this.options);
      delete newOptions.showTotals.subtotal;
      this.onUpdateConfig(newOptions);
    }
  }

  /**
   * @action updateSubtotal
   * @param {Object} dimension - the dimension object chosen for subtotal
   * set the dimension name as a subtotal in the table config
   */
  @action
  updateSubtotal(dimension) {
    this.onUpdateConfig({ showTotals: { subtotal: dimension.id } });
  }
}

export default NaviVisualizationConfigTableComponent;

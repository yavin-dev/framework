/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * <NaviVisualizationConfig::Table
 *    @request={{this.request}}
 *    @response={{this.response}}
 *    @options={{this.tableOptions}}
 *    @onUpdateConfig={{this.onUpdateConfig}}
 * />
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { Args as TableArgs } from 'navi-core/components/navi-visualizations/table';

export type Args = {
  options: TableArgs['options'];
  request: RequestFragment;
  onUpdateConfig(options: Partial<Args['options']>): void;
};

export default class NaviVisualizationConfigTableComponent extends Component<Args> {
  @service('navi-metadata') metadataService!: NaviMetadataService;

  /**
   * initial value to show subtotal dropdown
   */
  @tracked _showSubtotalDropdown = false;

  get showSubtotalDropdown(): boolean {
    const hasSubtotal = this.args.options?.showTotals?.subtotal !== undefined;
    return this._showSubtotalDropdown || hasSubtotal;
  }

  /**
   * the selected dimension column to show as subtotal
   */
  get selectedSubtotal(): ColumnFragment | undefined {
    const { options, request } = this.args;
    const subtotalIndex = options?.showTotals?.subtotal;
    if (subtotalIndex !== undefined) {
      return request.columns.objectAt(subtotalIndex);
    }
    return undefined;
  }

  /**
   * toggles flag in the visualization config
   * @param grandTotal - toggle grandTotal on/off
   */
  @action
  onToggleGrandTotal(grandTotal: boolean): void {
    this.args.onUpdateConfig({ showTotals: { grandTotal } });
  }

  /**
   * sets the first dimension in request as subtotal in options when toggled on or
   * deletes the subtotal property from the config when subtotal is toggled off
   * @param toggleSubtotal
   */
  @action
  onToggleSubtotal(toggleSubtotal: boolean): void {
    this._showSubtotalDropdown = toggleSubtotal;
    if (toggleSubtotal) {
      const { request } = this.args;
      const firstDim = request.columns.indexOf(request.dimensionColumns[0]);
      this.args.onUpdateConfig({
        showTotals: { subtotal: firstDim }
      });
    } else if (this.args.options?.showTotals?.subtotal) {
      const newOptions = { ...this.args.options };
      delete newOptions?.showTotals?.subtotal;
      this.args.onUpdateConfig(newOptions);
    }
  }

  /**
   * @action updateSubtotal
   * @param {Object} dimension - the dimension object chosen for subtotal
   * set the dimension name as a subtotal in the table config
   */
  @action
  updateSubtotal(dimension: ColumnFragment): void {
    const subtotal = this.args.request.columns.indexOf(dimension);
    this.args.onUpdateConfig({ showTotals: { subtotal } });
  }
}

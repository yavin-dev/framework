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
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { Args as TableArgs } from 'navi-core/components/navi-visualizations/table';
import NaviVisualizationConfigBaseComponent from './base';

type Options = TableArgs['options'];

export default class NaviVisualizationConfigTableComponent extends NaviVisualizationConfigBaseComponent<Options> {
  /**
   * initial value to show subtotal dropdown
   */
  @tracked _showSubtotalDropdown = false;

  get showSubtotalDropdown(): boolean {
    return this._showSubtotalDropdown || !!this.args.options?.showTotals?.subtotal;
  }

  /**
   * the selected dimension column to show as subtotal
   */
  get selectedSubtotal(): ColumnFragment | undefined {
    const { options, request } = this.args;
    const subtotalCid = options?.showTotals?.subtotal;
    return request.columns.find((column) => column.cid === subtotalCid);
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
      const firstDim = request.dimensionColumns[0];
      this.args.onUpdateConfig({
        showTotals: { subtotal: firstDim?.cid },
      });
    } else if (this.args.options?.showTotals?.subtotal !== undefined) {
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
    this.args.onUpdateConfig({ showTotals: { subtotal: dimension.cid } });
  }
}

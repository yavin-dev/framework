/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import VisualizationBase from './visualization';
import { TableVisualizationMetadata, TableColumnAttributes } from 'navi-core/serializers/table';
import RequestFragment from './bard-request-v2/request';
import { validator, buildValidations } from 'ember-cp-validations';
import { readOnly } from '@ember/object/computed';
import { set } from '@ember/object';

const Validations = buildValidations(
  {
    metadata: validator('inline', {
      validate(metadata: TableVisualizationMetadata['metadata'], options: { request: RequestFragment }) {
        const { request } = options;
        const requestColumnIds = new Set(request.columns.map((_c, index) => index));

        const eachAttributeValid = Object.keys(metadata.columnAttributes)
          .map(Number)
          .every(columnId => requestColumnIds.has(columnId));

        const subtotalValid = metadata.showTotals?.subtotal ? requestColumnIds.has(metadata.showTotals.subtotal) : true;

        return !!request && eachAttributeValid && subtotalValid;
      },
      dependentKeys: ['model._request.columns.[]']
    })
  },
  {
    //Global Validation Options
    request: readOnly('model._request')
  }
);

export default class TableVisualization extends VisualizationBase.extend(Validations) {
  @attr('string', { defaultValue: 'table' })
  type!: string;

  @attr('number', { defaultValue: 2 })
  version!: number;

  @attr({
    defaultValue: () => {
      return { columnAttributes: {} };
    }
  })
  metadata!: TableVisualizationMetadata['metadata'];

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request: RequestFragment, _response: TODO): TableVisualization {
    const existingRequest = this._request || request;

    const { columnAttributes = {}, showTotals = {} } = this.metadata;

    const newColumnAttributes: Record<number, TableColumnAttributes | undefined> = {};
    Object.keys(columnAttributes).forEach(key => {
      const columnId = Number(key);
      const existingColumn = existingRequest.columns.objectAt(columnId);
      const newColumnIndex = request.columns
        .toArray()
        .findIndex(c => c.canonicalName === existingColumn?.canonicalName);
      if (newColumnIndex >= 0) {
        // if existing column is found move attributes
        newColumnAttributes[newColumnIndex] = columnAttributes[columnId];
      }
    });

    set(this.metadata, 'columnAttributes', newColumnAttributes);

    if (showTotals.subtotal) {
      const existingColumn = existingRequest.columns.objectAt(showTotals.subtotal);
      const subtotal = request.columns.toArray().findIndex(c => c.canonicalName === existingColumn?.canonicalName);
      set(this.metadata, 'showTotals', { subtotal, grandTotal: showTotals.grandTotal });
    }

    set(this, '_request', request);
    return this;
  }
}

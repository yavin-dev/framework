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
import { ResponseV1 } from 'navi-data/serializers/facts/interface';

function isConfigValid(request: RequestFragment, metadata: TableVisualizationMetadata['metadata']): boolean {
  const requestCids = new Set(request.columns.map(column => column.cid));

  const eachAttributeValid = Object.keys(metadata.columnAttributes).every(cid => requestCids.has(cid));

  const subtotalValid = metadata.showTotals?.subtotal ? requestCids.has(metadata.showTotals.subtotal) : true;

  return eachAttributeValid && subtotalValid;
}

const Validations = buildValidations(
  {
    metadata: validator('inline', {
      validate(metadata: TableVisualizationMetadata['metadata'], options: { request: RequestFragment }) {
        const { request } = options;
        return request && isConfigValid(request, metadata);
      },
      dependentKeys: ['model._request.columns.[]']
    })
  },
  {
    //Global Validation Options
    request: readOnly('model._request')
  }
);

export default class TableVisualization extends VisualizationBase.extend(Validations)
  implements TableVisualizationMetadata {
  @attr('string', { defaultValue: 'table' })
  type!: TableVisualizationMetadata['type'];

  @attr('number', { defaultValue: 2 })
  version!: TableVisualizationMetadata['version'];

  @attr({ defaultValue: () => ({ columnAttributes: {} }) })
  metadata!: TableVisualizationMetadata['metadata'];

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request: RequestFragment, _response: ResponseV1): TableVisualization {
    const { columnAttributes = {}, showTotals = {} } = this.metadata;

    const newColumnAttributes = Object.keys(columnAttributes).reduce((newColumnAttributes, cid) => {
      const existingColumn = request.columns.find(column => column.cid === cid);
      if (existingColumn) {
        newColumnAttributes[cid] = columnAttributes[cid];
      }
      return newColumnAttributes;
    }, {} as Record<string, TableColumnAttributes | undefined>);

    set(this.metadata, 'columnAttributes', newColumnAttributes);

    if (showTotals.subtotal) {
      const existingColumn = request.columns.find(column => column.cid === showTotals.subtotal);
      if (!existingColumn) {
        delete this.metadata.showTotals?.subtotal;
      }
    }

    return this;
  }
}

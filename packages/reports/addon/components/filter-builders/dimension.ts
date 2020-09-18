/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import BaseFilterBuilderComponent from './base';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import { FilterOperator } from 'navi-data/addon/adapters/facts/interface';

export default class DimensionFilterBuilderComponent extends BaseFilterBuilderComponent {
  get supportedOperators() {
    const storageStrategy = (this.args.filter.columnMetadata as DimensionMetadataModel).storageStrategy;

    //Allow free form input of dimension values when dimension's storageStrategy is 'none'
    const inputComponent =
      storageStrategy === 'none' ? 'filter-values/multi-value-input' : 'filter-values/dimension-select';

    return [
      { id: 'in' as const, name: 'Equals', valuesComponent: inputComponent },
      { id: 'notin' as FilterOperator, name: 'Not Equals', valuesComponent: inputComponent },
      {
        id: 'null' as const,
        name: 'Is Empty',
        valuesComponent: 'filter-values/null-input'
      },
      {
        id: 'notnull' as const,
        name: 'Is Not Empty',
        valuesComponent: 'filter-values/null-input'
      },
      {
        id: 'contains' as const,
        name: 'Contains',
        valuesComponent: 'filter-values/multi-value-input'
      }
    ];
  }
}

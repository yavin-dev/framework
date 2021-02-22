/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import BaseFilterBuilderComponent, { FilterValueBuilder } from './base';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import { assert } from '@ember/debug';

export const OPERATORS = <const>{
  in: 'in',
  notin: 'notin',
  isnulltrue: 'isnulltrue',
  isnullfalse: 'isnullfalse',
  contains: 'contains',
};
type InternalOperatorType = typeof OPERATORS[keyof typeof OPERATORS];

interface InteralFilterBuilderOperators extends FilterValueBuilder {
  internalId: InternalOperatorType;
}

export default class DimensionFilterBuilderComponent extends BaseFilterBuilderComponent {
  get selectedValueBuilder(): InteralFilterBuilderOperators {
    const { operator, values } = this.args.filter;

    let builder;
    if (operator === 'isnull' && values.length === 1) {
      if (values[0] === true) {
        builder = this.valueBuilders.find((builder) => builder.internalId === OPERATORS.isnulltrue);
      } else if (values[0] === false) {
        builder = this.valueBuilders.find((builder) => builder.internalId === OPERATORS.isnullfalse);
      }
    } else {
      builder = this.valueBuilders.find((builder) => builder.internalId === operator);
    }
    assert(`Filter operator: '${operator}' does not provide a builder in: ${this.constructor.name}`, builder);
    return builder;
  }

  get valueBuilders(): InteralFilterBuilderOperators[] {
    const storageStrategy = (this.args.filter.columnMetadata as DimensionMetadataModel).storageStrategy;

    //Allow free form input of dimension values when dimension's storageStrategy is 'none'
    const inputComponent =
      storageStrategy === 'none' ? 'filter-values/multi-value-input' : 'filter-values/dimension-select';

    return [
      { internalId: OPERATORS.in, operator: 'in' as const, name: 'Equals', component: inputComponent },
      { internalId: OPERATORS.notin, operator: 'notin' as const, name: 'Not Equals', component: inputComponent },
      {
        internalId: OPERATORS.isnulltrue,
        operator: 'isnull' as const,
        name: 'Is Empty',
        component: 'filter-values/null-input',
        defaultValues: [true],
      },
      {
        internalId: OPERATORS.isnullfalse,
        operator: 'isnull' as const,
        name: 'Is Not Empty',
        component: 'filter-values/null-input',
        defaultValues: [false],
      },
      {
        internalId: OPERATORS.contains,
        operator: 'contains' as const,
        name: 'Contains',
        component: 'filter-values/multi-value-input',
      },
    ];
  }
}

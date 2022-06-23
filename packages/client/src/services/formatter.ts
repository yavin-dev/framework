/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import numbro from 'numbro';
import type { Parameters } from '../request.js';
import type ColumnMetadataModel from '../models/metadata/column.js';
import type { MetricColumn } from '../models/metadata/metric.js';
import type { ResponseRow } from '../models/navi-fact-response.js';
import type { MetricValue } from '../serializers/facts/interface.js';
import type { PotentialParameterValue } from '../models/metadata/function-parameter.js';
import type FormatterServiceInterface from './interfaces/formatter.js';
import NativeWithCreate from '../models/native-with-create.js';

export default class FormatterService extends NativeWithCreate implements FormatterServiceInterface {
  async formatNiceColumnName(
    columnMetadata?: ColumnMetadataModel,
    parameters: Parameters = {},
    alias?: string | null
  ): Promise<string> {
    if (alias) {
      return alias;
    }

    const parameterValueLookups: Record<string, PotentialParameterValue[]> = {};
    const params = columnMetadata?.parameters ?? [];
    await Promise.all(
      params.map((param) =>
        param.values.then((values) => {
          parameterValueLookups[param.id] = values;
        })
      )
    );

    const paramNames = Object.entries(parameters).map(([name, value]) =>
      parameterValueLookups[name] ? parameterValueLookups[name].find((e) => e.id === value)?.name ?? value : value
    );

    const name = columnMetadata?.name ?? '--';
    return paramNames.length ? `${name} (${paramNames.join(',')})` : name;
  }

  formatColumnName(columnMetadata?: ColumnMetadataModel, parameters?: Parameters, alias?: string | null): string {
    if (alias) {
      return alias;
    }

    const paramValues = Object.values(parameters || {});
    const name = columnMetadata?.name || '--';
    if (paramValues.length) {
      return `${name} (${paramValues.join(',')})`;
    } else {
      return name;
    }
  }

  formatMetricValue(value: MetricValue, _column: MetricColumn, _row: ResponseRow, requestedFormat?: string): string {
    if (!value) {
      return '--';
    }
    const format = requestedFormat ? requestedFormat : { thousandSeparated: true };
    return numbro(value).format(format);
  }
}

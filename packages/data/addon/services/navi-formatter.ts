/* eslint-disable prettier/prettier */
/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { isEmpty } from '@ember/utils';
import numbro from 'numbro';
import type { Parameters } from 'navi-data/adapters/facts/interface';
import type ColumnMetadataModel from 'navi-data/models/metadata/column';
import type { MetricColumn } from 'navi-data/models/metadata/metric';
import type { ResponseRow } from 'navi-data/models/navi-fact-response';
import type { MetricValue } from 'navi-data/serializers/facts/interface';
import type { PotentialParameterValue } from 'navi-data/models/metadata/function-parameter';
import { hash } from 'ember-concurrency';

export default class NaviFormatterService extends Service {
  async formatNiceColumnName(
    columnMetadata?: ColumnMetadataModel,
    parameters: Parameters = {},
    alias?: string | null
  ): Promise<string> {
    if (alias) {
      return alias;
    }

    const lookups: Record<string, Promise<PotentialParameterValue[]>> = {};
    columnMetadata?.parameters?.forEach((e) => (lookups[e.id] = e.values));
    const parameterValueLookups = await hash(lookups);

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
    if (isEmpty(value)) {
      return '--';
    }
    const format = requestedFormat ? requestedFormat : { thousandSeparated: true };
    return numbro(value).format(format);
  }
}

declare module '@ember/service' {
  interface Registry {
    'navi-formatter': NaviFormatterService;
  }
}

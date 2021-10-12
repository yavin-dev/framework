/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { omit } from 'lodash-es';
import { isEmpty } from '@ember/utils';
import numeral from 'numeral';
import type { Parameters } from 'navi-data/adapters/facts/interface';
import type ColumnMetadataModel from 'navi-data/models/metadata/column';
import type { MetricColumn } from 'navi-data/models/metadata/metric';
import type { ResponseRow } from 'navi-data/models/navi-fact-response';
import type { MetricValue } from 'navi-data/serializers/facts/interface';

export default class NaviFormatterService extends Service {
  async formatColumnName(
    columnMetadata?: ColumnMetadataModel,
    parameters?: Parameters,
    alias?: string | null
  ): Promise<string> {
    if (alias) {
      return alias;
    }
    const allParams = omit(parameters || {}, 'as');
    const paramValues = Object.values(allParams);

    let parameterMetadata = await columnMetadata?.parameters[0]?.values;
    let paramNames = paramValues?.map((param) => {
      return parameterMetadata?.find((value) => value.id === param)?.name ?? {};
    });
    const name = columnMetadata?.name || '--';

    if (paramNames.length) {
      return `${name} (${paramNames.join(',')})`;
    } else {
      return name;
    }
  }

  formatMetricValue(value: MetricValue, _column: MetricColumn, _row: ResponseRow, requestedFormat?: string): string {
    if (isEmpty(value)) {
      return '--';
    }
    const format = requestedFormat ? requestedFormat : '0,0.[0000000000]';
    return numeral(value).format(format);
  }
}

declare module '@ember/service' {
  interface Registry {
    'navi-formatter': NaviFormatterService;
  }
}

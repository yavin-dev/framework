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
  async formatNiceColumnName(
    columnMetadata?: ColumnMetadataModel,
    parameters?: Parameters,
    alias?: string | null
  ): Promise<string> {
    if (alias) {
      return alias;
    }
    const allParams = omit(parameters || {}, 'as');
    const paramValues = Object.values(allParams);
    const parameterMetadata: { id: string; name?: string | undefined; description?: string | undefined }[] = [];

    columnMetadata?.parameters?.forEach(async function (e) {
      let parameterValues = await e.values;
      parameterValues?.forEach((value) => {
        parameterMetadata.push(value);
      });
    });
    await Promise.all(parameterMetadata);

    let paramNames = paramValues?.map((param) => {
      return parameterMetadata?.find((value) => value.id === param)?.name ?? param;
    });
    const name = columnMetadata?.name || '--';
    if (paramNames.length) {
      return `${name} (${paramNames.join(',')})`;
    } else {
      return name;
    }
  }

  formatColumnName(columnMetadata?: ColumnMetadataModel, parameters?: Parameters, alias?: string | null): string {
    if (alias) {
      return alias;
    }

    const allParams = omit(parameters || {}, 'as');
    const paramValues = Object.values(allParams);
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
    const format = requestedFormat ? requestedFormat : '0,0.[0000000000]';
    return numeral(value).format(format);
  }
}

declare module '@ember/service' {
  interface Registry {
    'navi-formatter': NaviFormatterService;
  }
}

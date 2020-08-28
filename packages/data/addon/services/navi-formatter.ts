/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { omit } from 'lodash-es';
import { ColumnMetadata } from 'navi-data/models/metadata/column';
import { Parameters } from 'navi-data/adapters/facts/interface';

export default class NaviFormatterService extends Service {
  formatColumnName(columnMetadata?: ColumnMetadata, parameters?: Parameters, alias?: string | null): string {
    const allParams = omit(parameters || {}, 'as');
    const paramValues = Object.values(allParams);

    const name = alias || columnMetadata?.name || '--';
    if (paramValues.length) {
      return `${name} (${paramValues.join(',')})`;
    } else {
      return name;
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'navi-formatter': NaviFormatterService;
  }
}

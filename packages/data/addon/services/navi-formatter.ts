/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { omit } from 'lodash-es';
import type { Parameters } from 'navi-data/adapters/facts/interface';
import type ColumnMetadataModel from 'navi-data/models/metadata/column';

export default class NaviFormatterService extends Service {
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
}

declare module '@ember/service' {
  interface Registry {
    'navi-formatter': NaviFormatterService;
  }
}

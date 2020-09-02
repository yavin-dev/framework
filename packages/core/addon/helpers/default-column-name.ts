/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import NaviFormatterService from 'navi-data/services/navi-formatter';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';

/**
 * Get column default display name
 *
 * @method getColumnDefaultName
 * @param column - request column fragment
 * @param naviFormatter - navi formatter service
 * @return default display name
 */
export function getColumnDefaultName(column: ColumnFragment, naviFormatter: NaviFormatterService): string {
  return naviFormatter.formatColumnName(column.columnMetadata, column.parameters, column.alias);
}

export default class DefaultColumnNameHelper extends Helper {
  @service naviFormatter!: NaviFormatterService;

  compute([column]: [ColumnFragment]) {
    return getColumnDefaultName(column, this.naviFormatter);
  }
}

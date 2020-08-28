/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { formatDimensionName } from 'navi-data/utils/dimension';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';

/**
 * Get column default display name
 *
 * @method chartToolTipFormat
 * @param {Object} column - table column object
 * @param {Object} naviMetadata - metadata service
 * @param {String} dateSourceName - name of data source
 * @return {String} - default display name
 */
export function getColumnDefaultName(column, naviMetadata, naviFormatter, dateSourceName = getDefaultDataSourceName()) {
  let model = naviMetadata.getById(column.type, column.field, dateSourceName);

  if (column.type === 'metric') {
    return naviFormatter.formatColumnName(model, column.parameters);
  }

  if (column.type === 'dimension' && column.field) {
    return formatDimensionName({
      name: model?.name,
      field: column.parameters.field
    });
  }

  return model?.name;
}

export default class DefaultColumnNameHelper extends Helper {
  @service naviMetadata;
  @service naviFormatter;

  compute([column, dateSourceName]) {
    return getColumnDefaultName(column, this.naviMetadata, this.naviFormatter, dateSourceName);
  }
}

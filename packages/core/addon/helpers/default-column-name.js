/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { metricFormat } from 'navi-data/helpers/metric-format';
import { mapColumnAttributes } from 'navi-data/utils/metric';
import { formatDimensionName } from 'navi-data/utils/dimension';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';

/**
 * Get column default display name
 *
 * @method chartToolTipFormat
 * @param {Object} column - table column object
 * @param {Object} bardMetadata - bard metadata service
 * @param {String} namespace - meta data namespace
 * @return {String} - default display name
 */
export function getColumnDefaultName({ type, attributes }, bardMetadata, namespace = getDefaultDataSourceName()) {
  if (type === 'dateTime') {
    return 'Date';
  }

  if (type === 'threshold') {
    type = 'metric';
  }

  let { name, field } = attributes,
    model = bardMetadata.getById(type, name, namespace);

  if (type === 'metric') {
    return metricFormat(mapColumnAttributes(attributes), model.name);
  }

  if (type === 'dimension' && field) {
    return formatDimensionName({
      name: model.name,
      field
    });
  }

  return model.name;
}

export default Helper.extend({
  bardMetadata: service(),

  compute([column, namespace]) {
    return getColumnDefaultName(column, this.bardMetadata, namespace);
  }
});

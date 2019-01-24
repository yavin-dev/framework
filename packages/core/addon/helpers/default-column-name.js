/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 */
import Helper from '@ember/component/helper';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { metricFormat } from 'navi-data/helpers/metric-format';
import { formatDimensionName } from 'navi-data/utils/dimension';

/**
 * Get column default display name
 *
 * @method chartToolTipFormat
 * @param {Object} column - table column object
 * @param {Object} bardMetadata - bard metadata service
 * @return {String} - default display name
 */
export function getColumnDefaultName({ type, field }, bardMetadata) {
  if (type === 'dateTime') {
    return 'Date';
  }

  if (type === 'threshold') {
    type = 'metric';
  }

  let model = bardMetadata.getById(type, field[type]);

  if (type === 'metric') {
    return metricFormat(field, model.longName);
  }

  if (type === 'dimension' && field.field) {
    return formatDimensionName({
      dimension: model.longName,
      field: field.field
    });
  }

  return model.longName;
}

export default Helper.extend({
  bardMetadata: service(),

  compute([column]) {
    return getColumnDefaultName(column, get(this, 'bardMetadata'));
  }
});

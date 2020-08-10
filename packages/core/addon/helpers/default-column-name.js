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
export function getColumnDefaultName(
  { type, attributes },
  naviMetadata,
  naviFormatter,
  dateSourceName = getDefaultDataSourceName()
) {
  if (type === 'dateTime') {
    return 'Date';
  }

  let { name: id, field } = attributes,
    model = naviMetadata.getById(type, id, dateSourceName);

  //if metadata isn't found, check time-dimension bucket
  //TODO: replace when we have full vizualization support for time-dimensions
  if (model === undefined && type == 'dimension') {
    model = naviMetadata.getById('timeDimension', id, dateSourceName);
  }

  if (type === 'metric') {
    return naviFormatter.formatMetric(model, attributes.parameters);
  }

  if (type === 'dimension' && field) {
    return formatDimensionName({
      id: model.name,
      field
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

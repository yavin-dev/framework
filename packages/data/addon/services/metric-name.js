/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { parseMetricName } from 'navi-data/utils/metric';
import { metricFormat } from 'navi-data/helpers/metric-format';
import { get } from '@ember/object';

export default Service.extend({
  /**
   * @property {Service} metricMeta
   */
  metricMeta: service('bard-metadata'),

  /**
   * @method getLongName
   * @param {String} metricId - base metric name for a metric
   * @returns {String} - long name for the metric from the metadata
   */
  getLongName(metricId) {
    return get(this, 'metricMeta').getMetaField('metric', metricId, 'longName', metricId);
  },

  /**
   * @method getDisplayName
   * @param {String} canonicalName - metric's canonical name
   * @returns {String} formatted metric display name
   */
  getDisplayName(canonicalName) {
    let metricObject = parseMetricName(canonicalName),
        metricId = get(metricObject, 'metric'),
        longName = this.getLongName(metricId);

    return metricFormat(metricObject, longName);
  }
});

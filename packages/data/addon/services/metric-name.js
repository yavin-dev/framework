/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { metricFormat } from 'navi-data/helpers/metric-format';

export default class MetricNameService extends Service {
  /**
   * @property {Service} metricMeta
   */
  @service('bard-metadata') metricMeta;

  /**
   * @method getLongName
   * @param {String} metricId - base metric name for a metric
   * @returns {String} - long name for the metric from the metadata
   */
  getLongName(metricId, namespace) {
    return this.metricMeta.getMetaField('metric', metricId, 'longName', metricId, namespace);
  }

  /**
   * @method getDisplayName
   * @param {Object} metricObject - object with metric and parameter properties
   * @returns {String} formatted metric display name
   */
  getDisplayName(metricObject, namespace) {
    const metricId = metricObject.metric;
    const longName = this.getLongName(metricId, namespace);

    return metricFormat(metricObject, longName);
  }
}

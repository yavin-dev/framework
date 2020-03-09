/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { inject as service } from '@ember/service';
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
  getLongName(metricId, namespace) {
    return get(this, 'metricMeta').getMetaField('metric', metricId, 'longName', metricId, namespace);
  },

  /**
   * @method getDisplayName
   * @param {Object} metricObject - object with metric and parameter properties
   * @returns {String} formatted metric display name
   */
  getDisplayName(metricObject, namespace) {
    let metricId = get(metricObject, 'metric'),
      longName = this.getLongName(metricId, namespace);

    return metricFormat(metricObject, longName);
  }
});

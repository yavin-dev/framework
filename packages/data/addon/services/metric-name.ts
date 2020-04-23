/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import NaviFormatterService from './navi-formatter';
import Metric from '../models/metadata/metric';

export default class MetricNameService extends Service {
  /**
   * @property {Service} metricMeta
   */
  @service('bard-metadata') bardMetadata: TODO;

  @service('navi-formatter') naviFormatter!: NaviFormatterService;

  /**
   * @method getLongName
   * @param {String} metricId - base metric name for a metric
   * @param {String} namespace - The namespace the metric lives in
   * @returns {String} - long name for the metric from the metadata
   */
  getLongName(metricId: string, namespace: string): string {
    return this.bardMetadata.getMetaField('metric', metricId, 'name', metricId, namespace);
  }

  /**
   * @method getDisplayName
   * @param {Object} metricObject - object with metric and parameter properties
   * @returns {String} formatted metric display name
   */
  getDisplayName(metricObject: TODO, namespace: string): string {
    const metricMeta: Metric = this.bardMetadata.getById('metric', metricObject.metric, namespace);
    return this.naviFormatter.formatMetric(metricMeta, metricObject.parameters);
  }
}

declare module '@ember/service' {
  interface Registry {
    'metric-name': MetricNameService;
  }
}

/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import NaviFormatterService from './navi-formatter';
import NaviMetadataService from './navi-metadata';

export default class MetricNameService extends Service {
  @service
  private naviMetadata!: NaviMetadataService;

  @service
  private naviFormatter!: NaviFormatterService;

  /**
   * @param metricId - base metric name for a metric
   * @param dataSourceName - name of data source
   * @returns - long name for the metric from the metadata
   */
  getName(metricId: string, dataSourceName: string): string | undefined {
    return this.naviMetadata.getById('metric', metricId, dataSourceName)?.name || metricId;
  }

  /**
   * @param metricObject - object with metric and parameter properties
   * @param dataSourceName - name of data source
   * @returns {String} formatted metric display name
   */
  //TODO use request v2 column obj
  getDisplayName(metricObject: TODO, dataSourceName: string): string {
    //TODO v2-ify
    const metricMeta = this.naviMetadata.getById('metric', metricObject.metric, metricObject.source || dataSourceName);
    return this.naviFormatter.formatColumnName(metricMeta, metricObject.parameters);
  }
}

declare module '@ember/service' {
  interface Registry {
    'metric-name': MetricNameService;
  }
}

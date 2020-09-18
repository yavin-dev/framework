/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Base Manifest File
 * This file registers the visualization with navi
 *
 */
import { assert } from '@ember/debug';
import EmberObject from '@ember/object';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { Grain } from 'navi-core/utils/date';

export default class NaviVisualizationBaseManifest extends EmberObject {
  name!: string;
  niceName!: string;
  icon!: string;

  /**
   * checks if the request has single metric
   */
  hasSingleMetric(request: RequestFragment): boolean {
    return request.metricColumns.length === 1;
  }

  /**
   * checks if the request has no metrics
   */
  hasNoMetric(request: RequestFragment): boolean {
    return request.metricColumns.length === 0;
  }

  /**
   * checks if the request has some metrics
   */
  hasMetric(request: RequestFragment): boolean {
    return !this.hasNoMetric(request);
  }

  /**
   * checks if the request has single time bucket
   */
  hasInterval(request: RequestFragment): boolean {
    const { timeGrain, interval } = request;

    return !!(timeGrain && interval);
  }

  /**
   * checks if the request has single time bucket
   */
  hasSingleTimeBucket(request: RequestFragment): boolean {
    const { timeGrain, interval } = request;

    return this.hasInterval(request) && interval?.diffForTimePeriod(timeGrain as Grain) === 1;
  }

  /**
   * checks if the request has no group by
   */
  hasNoGroupBy(request: RequestFragment): boolean {
    return request.columns.filter(({ type }) => type === 'dimension').length === 0;
  }

  /**
   * checks if the request has multiple metrics
   */
  hasMultipleMetrics(request: RequestFragment): boolean {
    return request.metricColumns.length > 1;
  }

  /**
   * checks if the request has multiple time buckets
   */
  hasMultipleTimeBuckets(request: RequestFragment): boolean {
    return this.hasInterval(request) && !this.hasSingleTimeBucket(request);
  }

  /**
   * checks if the request has a grouping dimension
   */
  hasGroupBy(request: RequestFragment): boolean {
    return !this.hasNoGroupBy(request);
  }

  /**
   * Decides whether visualization type is valid given request
   */
  typeIsValid(_request: RequestFragment): boolean {
    assert(`typeIsValid is not implemented in ${this.niceName}`);
  }
}

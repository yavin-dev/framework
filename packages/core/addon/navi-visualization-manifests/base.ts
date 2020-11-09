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
  hasExplicitSingleTimeBucket(request: RequestFragment): boolean {
    const { timeGrain, interval } = request;
    assert('request should have a timeGrain', timeGrain);
    if (this.hasInterval(request)) {
      return interval?.diffForTimePeriod(timeGrain) === 1;
    }

    return false;
  }

  /**
   * checks if the request has no group by
   */
  hasNoGroupBy(request: RequestFragment): boolean {
    return request.nonTimeDimensions.length === 0;
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
  hasPotentialMultipleTimeBuckets(request: RequestFragment): boolean {
    return !this.hasExplicitSingleTimeBucket(request);
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

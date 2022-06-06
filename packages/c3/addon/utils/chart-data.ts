/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ColumnFragment from 'navi-core/models/request/column';
import RequestFragment from 'navi-core/models/request';
import DataGroup from 'navi-core/utils/classes/data-group';
import { ResponseV1 } from '@yavin/client/serializers/facts/interface';

export const METRIC_SERIES = 'metric';
export const DIMENSION_SERIES = 'dimension';
export const DATE_TIME_SERIES = 'dateTime';

export type ChartType = typeof METRIC_SERIES | typeof DATE_TIME_SERIES | typeof DIMENSION_SERIES;

/**
 * Group data by dimensions
 *
 * @param rows - rows from bard response
 * @param config.dimensions - list of dimensions to chart
 * @returns rows grouped by composite key
 */
export function groupDataByDimensions(
  rows: ResponseV1['rows'],
  dimensions: ColumnFragment[]
): DataGroup<ResponseV1['rows'][number]> {
  return new DataGroup(rows, (row) => dimensions.map((dimension) => row[dimension.canonicalName]).join('|'));
}

/**
 * Determine chart type based on request
 *
 * @param request - request object
 * @returns the chart type
 */
export function chartTypeForRequest(request: RequestFragment): ChartType {
  if (request.nonTimeDimensions.length > 0) {
    return DIMENSION_SERIES;
  }

  const metricCount = request.metricColumns.length;
  const { timeGrain, interval } = request;
  const monthPeriod = interval?.diffForTimePeriod('month') || 0;
  const applicableTimeGrain = ['day', 'week', 'month'].includes(timeGrain || '');

  if (metricCount === 1 && monthPeriod > 12 && applicableTimeGrain) {
    return DATE_TIME_SERIES;
  }

  return METRIC_SERIES;
}

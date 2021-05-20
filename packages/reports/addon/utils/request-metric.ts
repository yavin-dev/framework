/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';
import type ColumnMetadataModel from 'navi-data/models/metadata/column';

export function getSelectedMetricsOfBase(metricMetadataModel: ColumnMetadataModel, request: RequestFragment) {
  return request.columns.filter(
    (column) => column.type === 'metric' && column.columnMetadata?.id === metricMetadataModel.id
  );
}

export function getFilteredMetricsOfBase(metricMetadataModel: ColumnMetadataModel, request: RequestFragment) {
  return request.filters.filter(
    (filter) => filter.type === 'metric' && filter.columnMetadata?.id === metricMetadataModel.id
  );
}

export function getUnfilteredMetricsOfBase(metricMetadataModel: ColumnMetadataModel, request: RequestFragment) {
  const selectedMetrics = getSelectedMetricsOfBase(metricMetadataModel, request);
  const filteredMetrics = getFilteredMetricsOfBase(metricMetadataModel, request);
  const filteredMetricNames = arr(filteredMetrics).mapBy('canonicalName');

  return arr(selectedMetrics).reject((metricColumn) => filteredMetricNames.includes(metricColumn.canonicalName));
}

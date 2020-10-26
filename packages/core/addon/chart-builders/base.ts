/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Mixin from '@ember/object/mixin';
import EmberObject from '@ember/object';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { DateTimeSeries, DimensionSeries, MetricSeries } from 'navi-core/models/chart-visualization';
import NaviFactResponse, { ResponseRow } from 'navi-data/models/navi-fact-response';
import DataGroup from 'navi-core/utils/classes/data-group';

export type SeriesType = MetricSeries['type'] | DimensionSeries['type'] | DateTimeSeries['type'];
export type SeriesConfig = MetricSeries['config'] | DimensionSeries['config'] | DateTimeSeries['config'];

export type C3Row = {
  x: {
    rawValue: string;
    displayValue: string;
  };
} & Record<string, number | null | undefined>;

export type TooltipData = {
  id: string;
  index: number;
  name: string;
  ratio: number;
  seriesIndex: number;
  value: number;
};
export interface BaseChartBuilder {
  byXSeries?: DataGroup<ResponseRow>;

  getXValue(row: ResponseRow, config: SeriesConfig, request: RequestFragment): string | number;

  buildData(response: NaviFactResponse, _config: SeriesConfig, request: RequestFragment): C3Row[];

  buildTooltip(
    _config: SeriesConfig,
    _request: RequestFragment
  ): Mixin<{ layout: unknown; rowData: unknown; tooltipData: TooltipData[]; x: string | number }, EmberObject>;
}

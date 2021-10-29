/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { set, computed, action } from '@ember/object';
import NaviVisualizationConfigSeriesChartComponent, { SeriesOptions } from './navi-visualization-config/series-chart';
import RequestFragment from 'navi-core/models/request';
import { DimensionSeriesValues } from 'navi-core/models/chart-visualization';
import ColumnFragment from 'navi-core/models/request/column';

type Args = SeriesOptions & {
  onUpdateConfig: NaviVisualizationConfigSeriesChartComponent['args']['onUpdateConfig'];
  request: RequestFragment;
};

export default class ChartSeriesConfigComponent extends Component<Args> {
  /**
   * array of series data in the form:
   * [{ metric: "adClicks", parameters: {} }, { ... }] for metrics or [{ name: "Dimension 1" }, { ... }] for dimensions
   */
  @computed('args.{seriesConfig.dimensions,seriesType,request.metricColumns.[]}')
  get seriesData(): DimensionSeriesValues[] | ColumnFragment[] {
    if (this.args.seriesType === 'dimension') {
      return this.args.seriesConfig.dimensions;
    } else if (this.args.seriesType === 'metric') {
      return this.args.request.metricColumns;
    }
    return [];
  }

  /**
   * @param series - new order of series
   */
  @action
  onReorderSeries(series: ChartSeriesConfigComponent['seriesData']) {
    // lowest item in stack should be first in order. Using `flex-flow: column-reverse` when rendering
    const reverseSeries = [...series].reverse();
    if (this.args.seriesType === 'dimension') {
      const newSeriesConfig = {
        ...this.args.seriesConfig,
        dimensions: reverseSeries,
      };
      this.args.onUpdateConfig(newSeriesConfig);
    } else if (this.args.seriesType === 'metric') {
      const { request } = this.args;
      let mIndex = 0;
      const newColumns = request.columns.map((col) => (col.type === 'metric' ? reverseSeries[mIndex++] : col));
      // directly setting columns gives TS errors
      // TODO: Extract into arg
      //@ts-expect-error
      set(this.args.request, 'columns', newColumns);
    }
  }
}

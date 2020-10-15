/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { assign } from '@ember/polyfills';
import { A as arr } from '@ember/array';
import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { isArray } from '@ember/array';
//@ts-ignore
import { copy } from 'ember-copy';
import { dataByDimensions } from 'navi-core/utils/data';
import { values, reject } from 'lodash-es';
import RequestFragment from '../../models/bard-request-v2/request';
import { ResponseV1 } from 'navi-data/addon/serializers/facts/interface';
import { getRequestDimensions } from 'navi-core/utils/chart-data';
import ColumnMetadataModel from 'navi-data/addon/models/metadata/column';

type Args = {
  request: RequestFragment;
  response: ResponseV1;
  seriesConfig: TODO;
  seriesType: TODO;
  onUpdateConfig: (config: TODO) => void;
};

type SeriesDim = {
  dimension: ColumnMetadataModel;
  value: string | number | boolean;
};

type SeriesForDimension = {
  searchKey: string;
  dimensions: SeriesDim[];
  config: {
    name: string;
    values: Record<string, string | number | boolean>;
  };
};

export default class NaviVisualizationConfigSeriesChartComponent extends Component<Args> {
  /**
   * @property {Object} selectedMetric
   */
  @computed('args.seriesConfig.metric')
  get selectedMetric() {
    const {
      args: {
        seriesConfig: { metric },
        request: { metricColumns: metrics }
      }
    } = this;
    return metrics.find(col => metric.metric === col.cid);
  }

  /**
   * @property {Boolean} showMetricSelect - whether to display the metric select
   */
  @computed('metrics', 'args.seriesType')
  get showMetricSelect() {
    const {
      args: {
        seriesType,
        request: { metricColumns: metrics }
      }
    } = this;
    return seriesType === 'dimension' && isArray(metrics) && metrics.length > 1;
  }

  /**
   * @property {DataGroup} dataByDimensions - response data grouped by dimension composite keys
   */
  @computed('args.{seriesConfig,response}')
  get dataByDimensions() {
    return dataByDimensions(this.args.response.rows, this.args.seriesConfig.dimensionOrder);
  }

  /**
   * @property {Object} seriesByDimensions - series objects grouped by dimension composite keys
   */
  @computed('dataByDimensions', 'args.request')
  get seriesByDimensions(): Record<string, SeriesForDimension> {
    const {
      args: { request },
      dataByDimensions
    } = this;
    const dimensions = getRequestDimensions(request);
    const keys = dataByDimensions.getKeys();

    // Build a series object for each series key
    return keys.reduce((series: Record<string, SeriesForDimension>, key) => {
      const data = dataByDimensions.getDataForKey(key);

      /*
       * Build a search key by adding all dimension values
       * along with a collection of dimensions used by series
       */
      let searchKey = '';
      const seriesDims: SeriesDim[] = [];
      const values: Record<string, string | number | boolean> = {};
      const dimensionLabels: Array<string | number | boolean> = [];

      for (let dimIndex = 0; dimIndex < dimensions.length; dimIndex++) {
        // Pull dimension id + description from response data
        const dimension = dimensions[dimIndex];
        const value = data[0][dimension.canonicalName] as string | number | boolean;
        searchKey += `${value} `;

        seriesDims.push({
          dimension: dimension.columnMetadata,
          value
        });

        dimensionLabels.push(value);
        assign(values, { [dimension.canonicalName]: value });
      }

      series[key] = {
        searchKey: searchKey.trim(),
        dimensions: seriesDims,
        config: {
          name: dimensionLabels.join(','),
          values
        }
      };
      return series;
    }, {});
  }

  /**
   * @property {Array} allSeriesData - all possible chart series data in the form:
   */
  @computed('seriesByDimensions')
  get allSeriesData() {
    return values(this.seriesByDimensions);
  }

  /**
   * @property {Array} selectedSeriesData - selected chart series data in the form:
   */
  @computed('args.seriesConfig')
  get selectedSeriesData() {
    const { dimensionOrder, dimensions: selectedDimensions } = this.args.seriesConfig;

    const keys = selectedDimensions.map((dim: TODO) =>
      dimensionOrder.map((dimension: string) => dim.values[dimension]).join('|')
    );
    return keys.map((key: string) => this.seriesByDimensions[key]);
  }

  /**
   * @method onAddSeries
   * @param {Object} series
   */
  @action
  onAddSeries(series: TODO) {
    const newSeriesConfig = copy(this.args.seriesConfig);
    const handleUpdateConfig = this.args.onUpdateConfig;

    arr(newSeriesConfig.dimensions).pushObject(series.config);
    if (handleUpdateConfig) handleUpdateConfig(newSeriesConfig);
  }

  /**
   * @method onRemoveSeries
   * @param {Object} series
   */
  @action
  onRemoveSeries(series: TODO) {
    const seriesInConfig = this.args.seriesConfig?.dimensions;
    const newSeriesConfig = copy(this.args.seriesConfig);
    const handleUpdateConfig = this.args.onUpdateConfig;

    //remove series from config
    newSeriesConfig.dimensions = reject(seriesInConfig, series.config);
    if (handleUpdateConfig) handleUpdateConfig(newSeriesConfig);
  }

  /**
   * @method onUpdateChartMetric
   */
  @action
  onUpdateChartMetric(metricCid: string) {
    const newConfig = copy(this.args.seriesConfig);
    const handleUpdateConfig = this.args.onUpdateConfig;
    newConfig.metricCid = metricCid;
    if (handleUpdateConfig) handleUpdateConfig(newConfig);
  }
}

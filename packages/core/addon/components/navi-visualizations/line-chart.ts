/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviVisualizations::LineChart
 *   @model={{this.model}}
 *   @options={{this.options}}
 * />
 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';
import EmberArray from '@ember/array';
import { readOnly } from '@ember/object/computed';
import { getOwner } from '@ember/application';
import { guidFor } from '@ember/object/internals';
import numeral from 'numeral';
import { merge } from 'lodash-es';
import moment from 'moment';
import { run } from '@ember/runloop';
import ChartBuildersBase from './chart-builders-base';
import { VisualizationModel } from './table';
import { BaseChartBuilder } from 'navi-core/chart-builders/base';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { ChartSeries, LineChartConfig } from 'navi-core/models/line-chart';
import { Grain } from 'navi-data/utils/date';

const DEFAULT_OPTIONS = <const>{
  style: {
    curve: 'line',
    area: false,
    stacked: false
  },
  axis: {
    x: {
      type: 'category',
      categories: [],
      tick: {
        culling: true,
        multiline: false
      }
    },
    y: {
      series: {
        type: 'metric',
        config: {}
      },
      tick: {
        format: (val: number) => numeral(val).format('0.00a'),
        count: 4
      },
      label: {
        position: 'outer-middle'
      }
    }
  },
  grid: {
    y: { show: true }
  },
  point: {
    r: 0,
    focus: {
      expand: { r: 4 }
    }
  }
};

type InsightsData = { index: number; actual: number; predicted: number; standardDeviation: number };

export type Args = {
  model: VisualizationModel;
  options: LineChartConfig['metadata'];
};

export default class LineChart extends ChartBuildersBase<Args> {
  /**
   * the type of c3 chart
   */
  chartType = 'line';

  /**
   * since line-chart is a tagless wrapper component,
   * classes specified here are applied to the underlying c3-chart component
   */
  classNames = ['line-chart-widget'];

  /**
   * builder based on series type
   */
  @computed('seriesConfig.type')
  get builder(): BaseChartBuilder {
    const {
      seriesConfig: { type },
      chartBuilders
    } = this;

    const chartBuilder = chartBuilders[type];
    assert(`There should be a chart-builder for ${type}`, chartBuilder);
    return chartBuilder;
  }

  /**
   * config options for the chart
   */
  @computed('args.options', 'dataConfig')
  get config() {
    const { pointConfig: point } = this;
    //deep merge DEFAULT_OPTIONS, custom options, and data
    return merge(
      {},
      DEFAULT_OPTIONS,
      this.args.options,
      this.dataConfig,
      this.dataSelectionConfig,
      { tooltip: this.chartTooltip },
      { point },
      { axis: { x: { type: 'category' } } }, // Override old 'timeseries' config saved in db
      this.yAxisLabelConfig,
      this.yAxisDataFormat,
      this.xAxisTickValues
    );
  }

  /**
   * y axis label config options for the chart
   */
  @computed('seriesConfig.config.metricCid', 'request.columns.@each.displayName')
  get yAxisLabelConfig() {
    const { seriesConfig } = this;
    if ('metricCid' in seriesConfig.config) {
      const { metricCid } = seriesConfig.config;
      const metric = this.request.columns.find(({ cid }) => cid === metricCid);
      assert(`a metric with cid ${seriesConfig.config.metricCid} should be found`, metric);
      return {
        axis: {
          y: {
            label: {
              text: metric.displayName
            }
          }
        }
      };
    }

    return {};
  }

  /**
   * options for determining chart series
   */
  @computed('args.options')
  get seriesConfig(): ChartSeries {
    const optionsWithDefault = merge({}, DEFAULT_OPTIONS, this.args.options);

    return optionsWithDefault.axis.y.series;
  }

  @readOnly('args.model.0.request') request!: RequestFragment;
  @readOnly('args.model.0.response') response!: ResponseV1;

  /**
   * point radius config options for chart
   */
  @computed('response.rows.length')
  get pointConfig() {
    const pointCount = this.response.rows.length;

    //set point radius higher for single data
    if (pointCount === 1) {
      return { r: 2 };
    }

    return { r: 0 };
  }

  /**
   * chart series data
   */
  @computed('request.columns.[]', 'response', 'builder', 'seriesConfig.config')
  get seriesData() {
    const { request, response, builder, seriesConfig } = this;
    return builder.buildData(response, seriesConfig.config, request);
  }

  /**
   * chart series groups for stacking
   */
  @computed('args.options', 'seriesConfig.config.dimensions.@each.name', 'request.metricColumns.@each.displayName')
  get seriesDataGroups() {
    const { request, seriesConfig } = this;
    const newOptions = merge({}, DEFAULT_OPTIONS, this.args.options);
    const { stacked } = newOptions.style;

    if (!stacked) {
      return [];
    }

    // if stacked, return [[ "Dimension 1", "Dimension 2", ... ]] or [[ "Metric 1", "Metric 2", ... ]]
    if (seriesConfig.type === 'dimension') {
      return [seriesConfig.config.dimensions.map(dimension => dimension.name)];
    } else if (seriesConfig.type === 'metric') {
      return [request.metricColumns.map(c => c.displayName)];
    }

    return [];
  }

  /**
   * configuration for chart x and y values
   */
  @computed('c3ChartType', 'seriesData', 'seriesDataGroups')
  get dataConfig() {
    const { c3ChartType, seriesData, seriesDataGroups } = this;

    /**
     * controls the order of stacking which should be the same as order of groups
     * `null` will be order the data loaded (object properties) which might not be predictable in some browsers
     */
    const order = seriesDataGroups[0] || null;

    return {
      data: {
        type: c3ChartType,
        json: seriesData,
        groups: seriesDataGroups,
        order,
        selection: {
          enabled: true
        }
      }
    };
  }

  /**
   * c3 chart type to determine line behavior
   */
  @computed('args.options', 'chartType')
  get c3ChartType() {
    const options = merge({}, DEFAULT_OPTIONS, this.args.options),
      { curve, area } = options.style;

    if (curve === 'line') {
      return area ? 'area' : 'line';
    } else if (curve === 'spline' || curve === 'step') {
      return area ? `area-${curve}` : curve;
    }

    return this.chartType;
  }

  /**
   * config for selecting data points on chart
   */
  @computed('args.model.[]')
  get dataSelectionConfig(): { dataSelection?: Promise<EmberArray<InsightsData>> } {
    // model is an array, and object at index 1 is insights data promise
    const insights = (this.args.model.objectAt(1) as unknown) as Promise<EmberArray<InsightsData>>;
    return insights ? { dataSelection: insights } : {};
  }

  /**
   * name of the tooltip component
   */
  get tooltipComponentName() {
    const guid = guidFor(this);
    const seriesType = this.seriesConfig.type;
    const chartType = this.chartType;
    return `${chartType}-chart-${seriesType}-tooltip-${guid}`;
  }

  /**
   * component used for rendering HTMLBars templates
   */
  @computed('firstModel', 'dataConfig')
  get tooltipComponent() {
    const { request, seriesConfig } = this;
    const tooltipComponentName = this.tooltipComponentName;
    const registryEntry = `component:${tooltipComponentName}`;
    const builder = this.builder;
    const owner = getOwner(this);
    const tooltipComponent = Component.extend(
      owner.ownerInjection(),
      builder.buildTooltip(seriesConfig.config, request),
      {
        renderer: owner.lookup('renderer:-dom')
      }
    );

    if (!owner.lookup(registryEntry)) {
      owner.register(registryEntry, tooltipComponent);
    }

    /*
     * Ember 3.x requires components to be registered with the container before they are instantiated.
     * Use the factory that has been registered instead of an anonymous component.
     */
    return owner.factoryFor(registryEntry);
  }

  /**
   * x axis tick positions for day/week/month grain on year chart grain
   */
  get xAxisTickValuesByGrain(): Partial<Record<Grain, number[] | undefined>> {
    const dayValues = [];
    for (let i = 0; i < 12; i++) {
      dayValues.push(
        moment()
          .startOf('year')
          .month(i)
          .dayOfYear()
      );
    }

    return {
      day: dayValues,
      // week.by.year in date-time is hardcoded to YEAR_WITH_53_ISOWEEKS (2015)
      week: [1, 5, 9, 13, 18, 22, 26, 31, 35, 39, 44, 48],
      month: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    };
  }

  /**
   * explicity specifies x axis tick positions for year chart grain
   */
  @computed('request.timeGrain', 'seriesConfig.{type,config.timeGrain}', 'xAxisTickValuesByGrain')
  get xAxisTickValues() {
    const { seriesConfig } = this;
    if (seriesConfig.type !== 'dateTime' || seriesConfig.config.timeGrain !== 'year') {
      return {};
    }
    const requestGrain = this.request?.timeGrain;

    const values = requestGrain ? this.xAxisTickValuesByGrain[requestGrain] : undefined;
    return {
      axis: {
        x: {
          tick: {
            values,
            fit: !values,
            culling: !values
          }
        }
      }
    };
  }

  /**
   * configuration for tooltip
   */
  @computed('seriesConfig.config', 'dataConfig.data.json', 'tooltipComponent', 'firstModel')
  get chartTooltip() {
    const rawData = this.dataConfig.data?.json;
    const tooltipComponent = this.tooltipComponent;
    const request = this.request;
    const seriesConfig = this.seriesConfig.config;

    return {
      contents(tooltipData: { x: number }[]) {
        /*
         * Since tooltipData.x only contains the index value, map it
         * to the raw x value for better formatting
         */
        let x = rawData[tooltipData[0].x].x.rawValue,
          tooltip = tooltipComponent.create({
            tooltipData,
            x,
            request,
            seriesConfig
          });

        run(() => {
          let element = document.createElement('div');
          tooltip.appendTo(element);
        });

        let innerHTML = tooltip.element.innerHTML;
        tooltip.destroy();
        return innerHTML;
      }
    };
  }

  /**
   * @param val - number to format
   * @returns formatted number
   */
  formattingFunction = (val: number) => numeral(val).format('0.00a');

  /**
   * adds the formattingFunction to the chart config
   */
  @computed('formattingFunction')
  get yAxisDataFormat() {
    const format = this.formattingFunction;
    return { axis: { y: { tick: { format } } } };
  }

  /**
   * Fires before the element is destroyed
   * @override
   */
  willDestroy() {
    super.willDestroy();
    this._removeTooltipFromRegistry();
  }

  /**
   * Removes tooltip component from registry
   */
  private _removeTooltipFromRegistry() {
    const tooltipComponentName = this.tooltipComponentName;
    getOwner(this).unregister(`component:${tooltipComponentName}`);
  }
}

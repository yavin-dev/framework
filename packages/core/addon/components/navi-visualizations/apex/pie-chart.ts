/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::Apex::PieChart
 *   @model={{this.model}}
 *   @options={{this.visualizationOptions}}
 * />
 */
import ApexChartComponent from './base';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';
import { readOnly } from '@ember/object/computed';
import { fetchColor } from 'navi-core/utils/denali-colors';
import { merge } from 'lodash-es';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { guidFor } from '@ember/object/internals';
//@ts-ignore
import tooltipLayout from '../../../templates/chart-tooltips/pie-chart';
import { groupDataByDimensions } from 'navi-core/utils/chart-data';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';
import type { ApexOptions } from 'apexcharts';
import type { PieChartConfig } from 'navi-core/models/pie-chart';
import type { ChartSeries } from 'navi-core/models/chart-visualization';

type Series = { name?: string; data: number[] };

/**
 * shapes data into apex-friendly format
 */
export function normalize(request: RequestFragment, response: NaviFactResponse, config: ChartSeries) {
  const labels: string[] = [];
  let series: Series[] = [];
  if (config.type === 'dimension') {
    const metric = request.metricColumns.find(({ cid }) => cid === config.config.metricCid);
    assert('Metric is found by cid', metric);
    const byDim = groupDataByDimensions(response.rows, request.nonTimeDimensions);

    // Build the series required
    const seriesKeys = config.config.dimensions.map((s) =>
      request.nonTimeDimensions.map((d) => s.values[d.cid]).join('|')
    );

    series = [
      {
        name: metric?.canonicalName,
        data: [] as number[],
      },
    ];

    // Adding the series to the keys
    seriesKeys.forEach((s) => {
      //Handling the case when some of the data group does not exist
      let value: number | null;
      if (byDim.getDataForKey(s) && byDim.getDataForKey(s).length) {
        value = Number(byDim.getDataForKey(s)[0][metric.canonicalName]);
      } else {
        value = null;
      }
      series[0].data.push(value as any);
    });

    let labelCanonicalNames = config.config.dimensions.map((series) => series.name);
    labels.push(...labelCanonicalNames);
  } else if (config.type === 'metric') {
    const { metricColumns } = request;

    series = [{ data: [] as number[] }];

    // generate labels and populate data for each metric
    [response.rows[0]].forEach((row) => {
      metricColumns.forEach((metric) => {
        let val = row[metric.canonicalName];
        const num = Number(val);
        series[0].data.push(num);

        labels.push(metric.displayName);
      });
    });
  }

  return { labels, series };
}

export default class ApexPieChartComponent extends ApexChartComponent {
  extraClassNames = 'pie-chart-widget pie-chart-widget--apex';

  @readOnly('args.options.series') declare seriesConfig: PieChartConfig['metadata']['series'];

  @computed('baseOptions', 'pieChartOptions', 'dataOptions')
  get chartOptions(): ApexOptions {
    const { baseOptions, pieChartOptions, chartTooltip, dataOptions } = this;

    return merge({}, baseOptions, pieChartOptions, chartTooltip, dataOptions);
  }

  @computed('request.metricColumns.@each.displayName', 'seriesConfig.{type,config.metricCid}')
  get metric() {
    const { request, seriesConfig } = this;
    if (seriesConfig.type === 'dimension') {
      const { metricCid } = seriesConfig.config;
      return request?.metricColumns.find(({ cid }) => cid === metricCid);
    }
    return undefined;
  }

  @computed('metric.displayName')
  get title() {
    return this.metric?.displayName;
  }

  get pieChartOptions(): ApexOptions {
    return {
      chart: {
        type: 'pie',
      },
      dataLabels: {
        formatter: (val) => `${val.toFixed(2)}%`,
      },
    };
  }

  @computed('request.metricColumns.[]', 'response.rows.[]', 'seriesConfig.{type,config.metricCid}')
  get chartData() {
    const { request, response, seriesConfig } = this;
    return normalize(request, response, seriesConfig);
  }

  @computed('request.metricColumns.[]', 'chartData', 'seriesConfig.{type,config.metricCid}')
  get series(): number[] {
    const { chartData } = this;
    return chartData.series[0].data;
  }

  @computed('chartData', 'title')
  get dataOptions(): ApexOptions {
    const { chartData, title } = this;

    return {
      colors: chartData.labels.map((_, i) => fetchColor(i)),
      labels: chartData.labels,
      title: {
        text: title,
      },
    };
  }

  /**
   * name of the tooltip component
   */
  get tooltipComponentName() {
    return `pie-chart-tooltip-${guidFor(this)}`;
  }

  /**
   * component used for rendering HTMLBars templates
   */
  get tooltipComponent() {
    const owner = getOwner(this);
    const registryEntry = `component:${this.tooltipComponentName}`;
    if (!owner.lookup(registryEntry)) {
      const tooltipComponent = Component.extend(
        owner.ownerInjection(),
        { layout: tooltipLayout },
        { renderer: owner.lookup('renderer:-dom') }
      );
      owner.register(registryEntry, tooltipComponent);
    }

    /*
     * Ember 3.x requires components to be registered with the container before they are instantiated.
     * Use the factory that has been registered instead of an anonymous component.
     */
    return owner.factoryFor(registryEntry);
  }

  /**
   * configuration for tooltip
   */
  @computed('metric')
  get chartTooltip(): ApexOptions {
    const { tooltipComponent, metric } = this;

    return {
      tooltip: {
        custom({ series, seriesIndex, w }) {
          const tooltip = tooltipComponent.create({
            metric,
            requiredToolTipData: {
              seriesIndex,
              ratio: w.globals.seriesPercent[seriesIndex][0] / 100,
              value: series[seriesIndex],
              name: w.globals.labels[seriesIndex],
            },
          });

          run(() => {
            let element = document.createElement('div');
            tooltip.appendTo(element);
          });

          let innerHTML = tooltip.element.innerHTML;
          tooltip.destroy();
          return innerHTML;
        },
      },
    };
  }

  /**
   * Removes tooltip component from registry
   */
  _removeTooltipFromRegistry() {
    getOwner(this).unregister(`component:${this.tooltipComponentName}`);
  }

  /**
   * Removes manual metric label from html and tooltip from registry
   */
  willDestroy() {
    super.willDestroy();
    this._removeTooltipFromRegistry();
  }
}

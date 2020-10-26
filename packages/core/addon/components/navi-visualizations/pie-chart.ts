/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import d3 from 'd3';
import { readOnly } from '@ember/object/computed';
import Component from '@ember/component';
import { assert } from '@ember/debug';
import { computed, action } from '@ember/object';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { guidFor } from '@ember/object/internals';
//@ts-ignore
import tooltipLayout from '../../templates/chart-tooltips/pie-chart';
import { merge } from 'lodash-es';
import { VisualizationModel } from './table';
import { smartFormatNumber } from 'navi-core/helpers/smart-format-number';
import { getTranslation } from '../../utils/chart';
import ChartBuildersBase from './chart-builders-base';
import RequestV2 from '../../models/bard-request-v2/request';
import NaviFactResponse from 'navi-data/addon/models/navi-fact-response';
import { BaseChartBuilder, SeriesType, TooltipData } from 'navi-core/chart-builders/base';
import { ChartSeries } from 'navi-core/models/chart-visualization';
import { PieChartConfig } from 'navi-core/models/pie-chart';

export type PieChartOptions = PieChartConfig['metadata'];

export type Args = {
  model: VisualizationModel;
  options: PieChartOptions;
};

export default class NaviVisualizationsPieChartComponent extends ChartBuildersBase<Args> {
  /**
   * pie-chart-widget with its ember id appended to it
   */
  get chartId(): string {
    return `pie-chart-widget-${guidFor(this)}`;
  }

  /**
   * since pie-chart is a tagless wrapper component,
   * classes specified here are applied to the underlying c3-chart component
   */
  get widgetClassNames(): string[] {
    return ['pie-chart-widget', this.chartId];
  }

  @readOnly('args.model.firstObject.request') request!: RequestV2;

  @readOnly('args.model.firstObject.response') response!: NaviFactResponse;

  /**
   * @property builder - builder based on series type
   */
  @computed('seriesType')
  get builder(): BaseChartBuilder {
    const { seriesType: type, chartBuilders: builders } = this;
    const chartBuilder = builders[type];

    assert(`There should be a chart-builder for ${type}`, chartBuilder);
    return chartBuilder;
  }

  /**
   * config for chart series
   */
  @readOnly('args.options.series.config') seriesConfig!: ChartSeries['config'];

  @readOnly('args.options.series.type') seriesType!: SeriesType;

  /**
   * Formatter for label (percentage value) shown on pie slices
   * pie chart specific config
   */
  get pieConfig() {
    return {
      pie: {
        label: {
          format: (_: unknown, ratio: number) => {
            return smartFormatNumber([ratio * 100]) + '%';
          }
        }
      }
    };
  }

  /**
   * The metric based on the cid stored in the seriesConfig
   */
  @computed('request.columns.[]', 'seriesConfig.metricCid')
  get metric() {
    if ('metricCid' in this.seriesConfig) {
      const {
        request,
        seriesConfig: { metricCid }
      } = this;
      return request.columns.findBy('cid', metricCid);
    }
    return undefined;
  }

  /**
   * data config
   */
  @computed('model.firstObject', 'seriesConfig')
  get dataConfig() {
    const { builder, request, response, seriesConfig } = this;
    const seriesData = builder.buildData(response, seriesConfig, request);

    return {
      data: {
        type: 'pie',
        json: seriesData
      }
    };
  }

  /**
   * config options for the chart
   */
  @computed('args.options', 'dataConfig')
  get config() {
    return merge({}, this.pieConfig, this.args.options, this.dataConfig, {
      tooltip: this.chartTooltip
    });
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
    let owner = getOwner(this),
      tooltipComponentName = this.tooltipComponentName,
      registryEntry = `component:${tooltipComponentName}`,
      byXSeries = this.builder.byXSeries,
      tooltipComponent = Component.extend(
        owner.ownerInjection(),
        {
          layout: tooltipLayout,

          rowData: computed('x', 'requiredToolTipData', function() {
            assert('buildData must be called in the chart-builder before the tooltip can be rendered', byXSeries);
            // Get the full data for this combination of x + series
            const series = this.requiredToolTipData;
            const dataForSeries = byXSeries.getDataForKey(`${this.x} ${series.id}`) || [];

            return dataForSeries[0];
          })
        },
        { renderer: owner.lookup('renderer:-dom') }
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
   * configuration for tooltip
   */
  @computed('metric')
  get chartTooltip() {
    const { tooltipComponent, metric } = this;
    const rawData = this.dataConfig.data.json;

    return {
      contents(tooltipData: TooltipData[]) {
        let x = rawData[0].x.rawValue,
          tooltip = tooltipComponent.create({
            x,
            requiredToolTipData: tooltipData[0],
            metric
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
   * Removes manual metric label from html and tooltip from registry
   */
  willDestroy() {
    super.willDestroy();
    this._removeMetricLabel();
    this._removeTooltipFromRegistry();
  }

  /**
   * Removes tooltip component from registry
   * @method _removeTooltipFromRegistry
   * @private
   */
  _removeTooltipFromRegistry() {
    const tooltipComponentName = this.tooltipComponentName;
    getOwner(this).unregister(`component:${tooltipComponentName}`);
  }

  /**
   * Removes metric label from pie chart
   * @method _removeMetricLabel
   * @private
   */
  _removeMetricLabel() {
    let tspans = d3.selectAll(`.${this.chartId} text.c3-title > .pie-metric-label`);
    tspans.remove();
  }

  /**
   * Creates the pie chart's metric label
   */
  _drawMetricLabel() {
    const { metric } = this;
    const titleElm = d3.select(`.${this.chartId} text.c3-title`);
    const svgElm = d3.select(`.${this.chartId} svg`);
    const chartElm = d3.select(`.${this.chartId} .c3-chart-arcs`);
    /*
     * We want the metric label to be just to the left of the pie chart
     * Find the x translation of the pie chart element and subtract half the chart's width and 50 more pixels
     */
    const xTranslate = getTranslation(chartElm.attr('transform')).x - chartElm.node().getBBox().width / 2 - 50;
    const yTranslate = svgElm.style('height').replace('px', '') / 2; //vertically center the label in the svg

    if (metric) {
      titleElm
        .insert('tspan')
        .attr('class', 'pie-metric-label')
        .attr('y', 0)
        .attr('x', 0)
        .text(metric.displayName);

      //rotate the label to be vertical and place it just left of the pie chart
      titleElm.attr('text-anchor', 'middle').attr('transform', `translate(${xTranslate}, ${yTranslate}) rotate(-90)`);
    }
  }

  /**
   * Redraws the metric label. Called when pie chart is rendered.
   * @method redrawMetricLabel
   * @private
   */
  @action
  redrawMetricLabel() {
    if (!this.isDestroyed && !this.isDestroying) {
      this._removeMetricLabel();
      this._drawMetricLabel();
    }
  }
}

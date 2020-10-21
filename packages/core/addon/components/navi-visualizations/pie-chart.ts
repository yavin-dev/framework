/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/pie-chart
 *   model=model
 *   options=options
 * }}
 */

//@ts-ignore
import d3 from 'd3';
import { readOnly } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
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

export type Args = {
  model: VisualizationModel;
  options: TODO;
};

type TooltipData = {
  id: string;
  index: number;
  name: string;
  ratio: number;
  seriesIndex: number;
  value: number;
};

export default class NaviVisualizationsPieChartComponent extends ChartBuildersBase<Args> {
  /**
   * @property {Service} metricName
   */
  @service metricName: TODO;

  /**
   * @property {String} chartId - return pie-chart-widget with its ember id appended to it
   */
  get chartId() {
    return `pie-chart-widget-${guidFor(this)}`;
  }

  /**
   * @property {Array} widgetClassNames - since pie-chart is a tagless wrapper component,
   * classes specified here are applied to the underlying c3-chart component
   */
  get widgetClassNames() {
    return ['pie-chart-widget', this.chartId];
  }

  /**
   * @property {Object} request
   */
  @readOnly('args.model.firstObject.request') request!: RequestV2;

  /**
   * @property {String} namespace - meta data namespace to use
   */
  @readOnly('request.dataSource') namespace!: string;

  /**
   * @property {Object} builder - builder based on series type
   */
  @computed('seriesType')
  get builder() {
    const { seriesType: type, chartBuilders: builders } = this;

    return builders[type];
  }

  /**
   * @property {Object} seriesConfig - config for chart series
   */
  @readOnly('args.options.series.config') seriesConfig!: TODO;

  /**
   * @property {String} seriesType
   */
  @readOnly('args.options.series.type') seriesType: TODO;

  /**
   * Formatter for label (percentage value) shown on pie slices
   * @property {Object} pieConfig - pie chart specific config
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
   * @property {String} metricDisplayName - display name for metric
   */
  @computed('args.options', 'namespace')
  get metricDisplayName() {
    const {
      request,
      seriesConfig: { metricCid }
    } = this;
    const metricColumn = request.columns.findBy('cid', metricCid);
    const metric = { metric: metricColumn?.field, parameters: metricColumn?.parameters };

    return metricColumn && this.metricName.getDisplayName(metric, this.namespace);
  }

  /**
   * @property {Object} chart data config
   */
  @computed('model.firstObject', 'seriesConfig')
  get dataConfig() {
    const response = this.args.model?.firstObject?.response;
    const request = this.request;
    const seriesConfig = this.seriesConfig;
    const seriesData = this.builder.buildData(response, seriesConfig, request);

    return {
      data: {
        type: 'pie',
        json: seriesData
      }
    };
  }

  /**
   * @property {Object} config - config options for the chart
   */
  @computed('options', 'dataConfig')
  get config() {
    return merge({}, this.pieConfig, this.args.options, this.dataConfig, {
      tooltip: this.chartTooltip
    });
  }

  /**
   * @property {String} tooltipComponentName - name of the tooltip component
   */
  get tooltipComponentName() {
    return `pie-chart-tooltip-${guidFor(this)}`;
  }

  /**
   * @property {Component} tooltipComponent - component used for rendering HTMLBars templates
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
            // Get the full data for this combination of x + series
            const series = this.requiredToolTipData,
              dataForSeries = byXSeries.getDataForKey(this.x + series.id) || [];

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
   * @property {Object} chartTooltip - configuration for tooltip
   */
  @computed('seriesConfig.metric')
  get chartTooltip() {
    const tooltipComponent = this.tooltipComponent;
    const rawData = this.dataConfig.data.json;
    const metric = this.seriesConfig.metric;

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
   * Fires before the element is destroyed
   * @method willDestroy
   * @override
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
   * @method _drawMetricLabel
   * @private
   */
  _drawMetricLabel() {
    let titleElm = d3.select(`.${this.chartId} text.c3-title`),
      svgElm = d3.select(`.${this.chartId} svg`),
      chartElm = d3.select(`.${this.chartId} .c3-chart-arcs`),
      /*
       * We want the metric label to be just to the left of the pie chart
       * Find the x translation of the pie chart element and subtract half the chart's width and 50 more pixels
       */
      xTranslate = getTranslation(chartElm.attr('transform')).x - chartElm.node().getBBox().width / 2 - 50,
      yTranslate = svgElm.style('height').replace('px', '') / 2, //vertically center the label in the svg
      metricTitle = this.metricDisplayName;

    if (metricTitle) {
      titleElm
        .insert('tspan')
        .attr('class', 'pie-metric-label')
        .attr('y', 0)
        .attr('x', 0)
        .text(metricTitle);

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

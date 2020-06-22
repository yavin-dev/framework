/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/line-chart
 *   model=model
 *   options=options
 * }}
 */

import { A as arr } from '@ember/array';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { getOwner } from '@ember/application';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import layout from '../../templates/components/navi-visualizations/line-chart';
import numeral from 'numeral';
import { merge } from 'lodash-es';
import moment from 'moment';
import { run } from '@ember/runloop';
import hasChartBuilders from 'navi-core/mixins/components/has-chart-builders';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

const DEFAULT_OPTIONS = {
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
        config: {
          metrics: []
        }
      },
      tick: {
        format: val => numeral(val).format('0.00a'),
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

@templateLayout(layout)
@tagName('')
export default class LineChart extends Component.extend(hasChartBuilders) {
  /**
   * @property {Service} metricName
   */
  @service
  metricName;

  /**
   * @property {String} chartType - the type of c3 chart
   */
  chartType = 'line';

  /**
   * @property {Array} classNames - since line-chart is a tagless wrapper component,
   * classes specified here are applied to the underlying c3-chart component
   */
  classNames = ['line-chart-widget'];

  /**
   * @property {Object} builder - builder based on series type
   */
  @computed('seriesConfig.type')
  get builder() {
    const {
      seriesConfig: { type },
      chartBuilders
    } = this;

    return chartBuilders[type];
  }

  /**
   * @property {String} namespace - metadata namespace to use
   */
  @readOnly('firstModel.request.dataSource')
  namespace;

  /**
   * @property {Object} config - config options for the chart
   */
  @computed('options', 'dataConfig')
  get config() {
    const { pointConfig: point } = this;
    //deep merge DEFAULT_OPTIONS, custom options, and data
    return merge(
      {},
      DEFAULT_OPTIONS,
      this.options,
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
   * @property {Object} yAxisLabelConfig - y axis label config options for the chart
   */
  @computed('options')
  get yAxisLabelConfig() {
    const { metricDisplayName } = this;
    return metricDisplayName
      ? {
          axis: {
            y: {
              label: {
                text: metricDisplayName
              }
            }
          }
        }
      : {};
  }

  /**
   * @property {String} metricDisplayName - display name for the current metric in a non-metric chart
   */
  @computed('options', 'namespace')
  get metricDisplayName() {
    const {
      seriesConfig: {
        config: { metric }
      },
      metricName
    } = this;

    if (metric) {
      return metricName.getDisplayName(metric, this.namespace);
    }
    return undefined;
  }

  /**
   * @property {Object} seriesConfig - options for determining chart series
   */
  @computed('options')
  get seriesConfig() {
    const optionsWithDefault = merge({}, DEFAULT_OPTIONS, this.options);

    return optionsWithDefault.axis.y.series;
  }

  /**
   * @property {Object} firstModel - the first model in the model array
   */
  @computed('model.[]')
  get firstModel() {
    return arr(this.model).firstObject;
  }

  /**
   * @property {Object} pointConfig - point radius config options for chart
   */
  @computed('firstModel')
  get pointConfig() {
    const pointCount = this.firstModel?.response.rows.length;

    //set point radius higher for single data
    if (pointCount === 1) {
      return { r: 2 };
    }

    return { r: 0 };
  }

  /**
   * @property {Array} seriesData - chart series data
   */
  @computed('firstModel', 'builder', 'seriesConfig')
  get seriesData() {
    const request = this.firstModel?.request;
    const rows = this.firstModel?.response.rows;
    const builder = this.builder;
    const seriesConfig = this.seriesConfig.config;
    return builder.buildData(rows, seriesConfig, request);
  }

  /**
   * @property {Array} seriesDataGroups - chart series groups for stacking
   */
  @computed('options', 'seriesConfig', 'namespace')
  get seriesDataGroups() {
    const seriesConfig = this.seriesConfig;
    const seriesType = seriesConfig.type;
    const options = merge({}, DEFAULT_OPTIONS, this.options);
    const { stacked } = options.style;

    if (!stacked) {
      return [];
    }

    // if stacked, return [[ "Dimension 1", "Dimension 2", ... ]] or [[ "Metric 1", "Metric 2", ... ]]
    if (seriesType === 'dimension') {
      return [seriesConfig.config.dimensions.map(dimension => dimension.name)];
    } else if (seriesType === 'metric') {
      return [seriesConfig.config.metrics.map(metric => this.metricName.getDisplayName(metric, this.namespace))];
    }

    return [];
  }

  /**
   * @property {Object} dataConfig - configuration for chart x and y values
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
   * @property {String} c3ChartType - c3 chart type to determine line behavior
   */
  @computed('options', 'chartType')
  get c3ChartType() {
    const options = merge({}, DEFAULT_OPTIONS, this.options),
      { curve, area } = options.style;

    if (curve === 'line') {
      return area ? 'area' : 'line';
    } else if (curve === 'spline' || curve === 'step') {
      return area ? `area-${curve}` : curve;
    }

    return this.chartType;
  }

  /**
   * @property {Object} dataSelectionConfig - config for selecting data points on chart
   */
  @computed('model.[]')
  get dataSelectionConfig() {
    // model is an array, and object at index 1 is insights data promise
    const insights = this.model.objectAt(1);
    return insights ? { dataSelection: insights } : {};
  }

  /**
   * @property {String} tooltipComponentName - name of the tooltip component
   */
  get tooltipComponentName() {
    const guid = guidFor(this);
    const seriesType = this.seriesConfig.type;
    const chartType = this.chartType;
    return `${chartType}-chart-${seriesType}-tooltip-${guid}`;
  }

  /**
   * @property {Ember.Component} tooltipComponent - component used for rendering HTMLBars templates
   */
  @computed('firstModel', 'dataConfig')
  get tooltipComponent() {
    const request = this.firstModel?.request;
    const seriesConfig = this.seriesConfig.config;
    const tooltipComponentName = this.tooltipComponentName;
    const registryEntry = `component:${tooltipComponentName}`;
    const builder = this.builder;
    const owner = getOwner(this);
    const tooltipComponent = Component.extend(owner.ownerInjection(), builder.buildTooltip(seriesConfig, request), {
      renderer: owner.lookup('renderer:-dom')
    });

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
   * @property {Object} xAxisTickValuesByGrain - x axis tick positions for day/week/month grain on year chart grain
   */
  get xAxisTickValuesByGrain() {
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
   * @property {Object} xAxisTickValues - explicity specifies x axis tick positions for year chart grain
   */
  @computed('model.firstObject', 'seriesConfig')
  get xAxisTickValues() {
    const chartGrain = this.seriesConfig.config.timeGrain;
    if (chartGrain !== 'year') {
      return {};
    }
    const requestGrain = this.model?.firstObject?.request?.logicalTable?.timeGrain;

    const values = this.get('xAxisTickValuesByGrain')[requestGrain];
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
   * @property {Object} chartTooltip - configuration for tooltip
   */
  @computed('seriesConfig.config', 'dataConfig.data.json', 'tooltipComponent', 'firstModel')
  get chartTooltip() {
    const rawData = this.dataConfig.data?.json;
    const tooltipComponent = this.tooltipComponent;
    const request = this.firstModel?.request;
    const seriesConfig = this.seriesConfig.config;

    return {
      contents(tooltipData) {
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
   * @property {Function} formattingFunction
   * @callback formattingFunction
   * @param {Number} val - number to format
   * @returns {Number} - formatted number
   */
  formattingFunction = val => numeral(val).format('0.00a');

  /**
   * @property {Object} yAxisDataFormat - adds the formattingFunction to the chart config
   */
  @computed('formattingFunction')
  get yAxisDataFormat() {
    const formattingFunction = this.formattingFunction;
    return {
      axis: {
        y: {
          tick: {
            format: formattingFunction
          }
        }
      }
    };
  }

  /**
   * Fires before the element is destroyed
   * @method willDestroyElement
   * @override
   */
  willDestroyElement() {
    super.willDestroyElement(...arguments);
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
}

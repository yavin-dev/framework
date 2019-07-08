/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/line-chart
 *   model=model
 *   options=options
 * }}
 */

/* global requirejs */

import { A as arr } from '@ember/array';
import Component from '@ember/component';
import { camelize } from '@ember/string';
import { computed, get } from '@ember/object';
import config from 'ember-get-config';
import { getOwner } from '@ember/application';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import layout from '../../templates/components/navi-visualizations/line-chart';
import numeral from 'numeral';
import merge from 'lodash/merge';
import moment from 'moment';
import { run } from '@ember/runloop';

const DEFAULT_OPTIONS = {
  style: {
    curve: 'line',
    area: false
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

export default Component.extend({
  layout,

  /**
   * @property {Service} metricName
   */
  metricName: service(),

  /**
   * @property {String} chartType - the type of c3 chart
   */
  chartType: 'line',

  /**
   * @property {String} tagName - don't render a DOM element
   */
  tagName: '',

  /**
   * @property {Array} classNames - since line-chart is a tagless wrapper component,
   * classes specified here are applied to the underlying c3-chart component
   */
  classNames: ['line-chart-widget'],

  /**
   * @param {Object} chartBuilders - map of chart type to builder
   */
  chartBuilders: computed(function() {
    // Find all chart builders registered in requirejs under the namespace "chart-builders"
    let builderRegExp = new RegExp(`^${config.modulePrefix}/chart-builders/(.*)`),
      chartBuilderEntries = Object.keys(requirejs.entries).filter(key => builderRegExp.test(key)),
      owner = getOwner(this),
      builderMap = chartBuilderEntries.reduce((map, builderName) => {
        let builderKey = camelize(builderRegExp.exec(builderName)[1]);

        map[builderKey] = owner.lookup(`chart-builder:${builderKey}`);
        return map;
      }, {});

    return builderMap;
  }),

  /**
   * @property {Object} builder - builder based on series type
   */
  builder: computed('seriesConfig.type', function() {
    let type = get(this, 'seriesConfig.type'),
      builders = get(this, 'chartBuilders');

    return builders[type];
  }),

  /**
   * @property {Object} config - config options for the chart
   */
  config: computed('options', 'dataConfig', function() {
    let point = get(this, 'pointConfig');
    //deep merge DEFAULT_OPTIONS, custom options, and data
    return merge(
      {},
      DEFAULT_OPTIONS,
      get(this, 'options'),
      get(this, 'dataConfig'),
      get(this, 'dataSelectionConfig'),
      { tooltip: get(this, 'chartTooltip') },
      { point },
      { axis: { x: { type: 'category' } } }, // Override old 'timeseries' config saved in db
      get(this, 'yAxisLabelConfig'),
      get(this, 'yAxisDataFormat'),
      get(this, 'xAxisTickValues')
    );
  }),

  /**
   * @property {Object} yAxisLabelConfig - y axis label config options for the chart
   */
  yAxisLabelConfig: computed('options', function() {
    let metricDisplayName = get(this, 'metricDisplayName');
    return metricDisplayName
      ? {
          axis: {
            y: {
              label: {
                text: get(this, 'metricDisplayName')
              }
            }
          }
        }
      : {};
  }),

  /**
   * @property {String} metricDisplayName - display name for the current metric in a non-metric chart
   */
  metricDisplayName: computed('options', function() {
    let seriesConfig = get(this, 'seriesConfig'),
      metricName = get(seriesConfig, 'config.metric');

    if (metricName) {
      return get(this, 'metricName').getDisplayName(metricName);
    }
  }),

  /**
   * @property {Object} seriesConfig - options for determining chart series
   */
  seriesConfig: computed('options', function() {
    let optionsWithDefault = merge({}, DEFAULT_OPTIONS, get(this, 'options'));

    return get(optionsWithDefault, 'axis.y.series');
  }),

  /**
   * @property {Object} firstModel - the first model in the model array
   */
  firstModel: computed('model.[]', function() {
    const model = arr(get(this, 'model'));
    return get(model, 'firstObject');
  }),

  /**
   * @property {Object} pointConfig - point radius config options for chart
   */
  pointConfig: computed('firstModel', function() {
    const pointCount = get(this, 'firstModel.response.rows.length');

    //set point radius higher for single data
    if (pointCount === 1) {
      return { r: 2 };
    }

    return { r: 0 };
  }),

  /**
   * @property {Object} data - configuration for chart x and y values
   */
  dataConfig: computed('firstModel', 'seriesConfig', 'c3ChartType', function() {
    const request = get(this, 'firstModel.request');
    const rows = get(this, 'firstModel.response.rows');
    const builder = get(this, 'builder');
    const seriesConfig = get(this, 'seriesConfig.config');
    const seriesData = builder.buildData(rows, seriesConfig, request);

    return {
      data: {
        type: get(this, 'c3ChartType'),
        json: seriesData,
        selection: {
          enabled: true
        }
      }
    };
  }),

  /**
   * @property {String} c3ChartType - c3 chart type to determine line behavior
   */
  c3ChartType: computed('options', 'chartType', function() {
    const options = merge({}, DEFAULT_OPTIONS, get(this, 'options')),
      { curve, area } = options.style;

    if (curve === 'line') {
      return area ? 'area' : 'line';
    } else if (curve === 'spline' || curve === 'step') {
      return area ? `area-${curve}` : curve;
    }

    return get(this, 'chartType');
  }),

  /**
   * @property {Object} dataSelectionConfig - config for selecting data points on chart
   */
  dataSelectionConfig: computed('model.[]', function() {
    // model is an array, and object at index 1 is insights data promise
    let insights = get(this, 'model').objectAt(1);
    return insights ? { dataSelection: insights } : {};
  }),

  /**
   * @property {String} tooltipComponentName - name of the tooltip component
   */
  tooltipComponentName: computed(function() {
    const guid = guidFor(this);
    const seriesType = get(this, 'seriesConfig.type');
    const chartType = get(this, 'chartType');
    return `${chartType}-chart-${seriesType}-tooltip-${guid}`;
  }),

  /**
   * @property {Ember.Component} tooltipComponent - component used for rendering HTMLBars templates
   */
  tooltipComponent: computed('firstModel', 'dataConfig', function() {
    const request = get(this, 'firstModel.request');
    const seriesConfig = get(this, 'seriesConfig.config');
    const tooltipComponentName = get(this, 'tooltipComponentName');
    const registryEntry = `component:${tooltipComponentName}`;
    const builder = get(this, 'builder');
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
  }),

  /**
   * @property {Object} xAxisTickValuesByGrain - x axis tick positions for day/week/month grain on year chart grain
   */
  xAxisTickValuesByGrain: computed(function() {
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
  }),

  /**
   * @property {Object} xAxisTickValues - explicity specifies x axis tick positions for year chart grain
   */
  xAxisTickValues: computed('model.firstObject', 'seriesConfig', function() {
    const chartGrain = get(this, 'seriesConfig.config.timeGrain');
    if (chartGrain !== 'year') {
      return {};
    }
    const requestGrain =
      get(this, 'model.firstObject.request.logicalTable.timeGrain.name') ||
      get(this, 'model.firstObject.request.logicalTable.timeGrain');

    const values = this.xAxisTickValuesByGrain[requestGrain];
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
  }),

  /**
   * @property {Object} chartTooltip - configuration for tooltip
   */
  chartTooltip: computed('seriesConfig.config', 'dataConfig.data.json', 'tooltipComponent', 'firstModel', function() {
    const rawData = get(this, 'dataConfig.data.json');
    const tooltipComponent = get(this, 'tooltipComponent');
    const request = get(this, 'firstModel.request');
    const seriesConfig = get(this, 'seriesConfig.config');

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
  }),

  /**
   * @property {Function} formattingFunction
   * @callback formattingFunction
   * @param {Number} val - number to format
   * @returns {Number} - formatted number
   */
  formattingFunction: val => numeral(val).format('0.00a'),

  /**
   * @property {Object} yAxisDataFormat - adds the formattingFunction to the chart config
   */
  yAxisDataFormat: computed('formattingFunction', function() {
    let formattingFunction = get(this, 'formattingFunction');
    return {
      axis: {
        y: {
          tick: {
            format: formattingFunction
          }
        }
      }
    };
  }),

  /**
   * Fires before the element is destroyed
   * @method willDestroyElement
   * @override
   */
  willDestroyElement() {
    this._super(...arguments);
    this._removeTooltipFromRegistry();
  },

  /**
   * Removes tooltip component from registry
   * @method _removeTooltipFromRegistry
   * @private
   */
  _removeTooltipFromRegistry() {
    const tooltipComponentName = get(this, 'tooltipComponentName');
    getOwner(this).unregister(`component:${tooltipComponentName}`);
  }
});

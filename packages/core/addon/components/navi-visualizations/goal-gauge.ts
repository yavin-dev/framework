/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{goal-gauge
 *    model=data
 *    options=options
 *  }}
 */

import { alias } from '@ember/object/computed';
import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import numeral from 'numeral';
// @ts-ignore
import d3 from 'd3';
import FilterFragment from 'dummy/models/bard-request-v2/fragments/filter';
import NaviFormatterService from 'navi-data/services/navi-formatter';
import NaviMetadataService from 'navi-data/addon/services/navi-metadata';
import { VisualizationModel } from './table';
import { GoalGaugeConfig } from 'navi-core/models/goal-gauge';
import ColumnFragment from 'dummy/models/bard-request-v2/fragments/column';

const DEFAULT_OPTIONS = {
  baselineValue: 0,
  goalValue: 0,
  metricTitle: '',
  metricCid: '',
  prefix: '',
  unit: '',
  thresholdColors: ['#f05050', '#ffc831', '#44b876'],
  thresholdPercentages: [75, 85, 100]
};
export type Args = {
  model: VisualizationModel;
  options: GoalGaugeConfig['metadata'];
};

export default class GoalGaugeVisualization extends Component<Args> {
  @service
  naviMetadata!: NaviMetadataService;
  @service
  naviFormatter!: NaviFormatterService;

  /**
   * @property {Array} - List of class names added to the gauge component
   */
  @computed()
  get widgetClassNames() {
    return ['goal-gauge-widget', `${guidFor(this)}-goal-gauge-widget`];
  }

  @computed('args.{model.firstObject.request.firstObject,options.metricCid}')
  get metric(): ColumnFragment {
    const { request } = this.args.model?.firstObject || {};
    const { metricCid } = this.args.options;
    const metricColumn = request?.metricColumns.find(({ cid }) => cid === metricCid);
    assert(`A metric column should exist with cid: ${metricCid}`, metricColumn);
    return metricColumn;
  }

  @computed('metric', 'args.model.firstObject.response')
  get actualValue(): number {
    const { model } = this.args;
    if (model) {
      const { response } = model?.firstObject || {};
      const firstRow = response?.rows?.[0] || {};
      const { canonicalName } = this.metric;
      let actualValue: number = firstRow[canonicalName] as number;
      return actualValue;
    }
    return 0;
  }
  /**
   * @property {object} - target metric model pulled from serialized request
   */
  @alias('args.model.firstObject.request.metricColumns.0') metricModel!: FilterFragment;

  /**
   * @property {Number} - starting value to measure progress towards the gaol
   */
  @alias('config.baselineValue') baselineValue = 0;

  /**
   * @property {Number} - value which is desired to be achieved
   */
  @alias('config.goalValue') goalValue = 0;

  /**
   * @property {Object} - legend configuration
   */
  legend = { hide: true };

  /**
   * @property {String} - name of data source
   */
  @alias('args.model.firstObject.request.dataSource') dataSourceName = '';

  /**
   * @property {String} formatted default metric
   */
  @computed('metric.{metric,parameters}', 'dataSourceName')
  get defaultMetricTitle() {
    return this.naviFormatter.formatColumnName(this.metric.columnMetadata, this.metric.parameters);
  }

  /**
   * @property {String} - The title for the goal metric
   */
  @computed('args.model.[]', 'metric')
  get metricTitle() {
    debugger;
    return this.metric.alias || this.defaultMetricTitle;
  }

  /**
   * @property {String} - Display value of goal
   */
  @computed('goalValue')
  get formattedGoalValue() {
    return this._formatNumber(this.goalValue);
  }

  /**
   * @property {String} - name of goal metricCid
   */
  @alias('config.metricCid') metricCid = '';

  /**
   * @property {String} - metric prefix
   */
  @alias('config.prefix') prefix = '';

  /**
   * @property {String} - metric unit
   */
  @alias('config.unit') unit = '';

  /**
   * @property {Object} - gauge tooltip configuration
   */
  tooltip = { show: false };

  /**
   * @property {Object} config - config options for the chart
   */
  @computed('args.options')
  get config() {
    return { ...DEFAULT_OPTIONS, ...this.args.options };
  }

  /**
   * @property {Object} - gauge data to render
   */
  @computed()
  get data() {
    return {
      columns: [['data', this.actualValue]],
      type: 'gauge'
    };
  }

  /**
   * @property {Object} - general gauge configuration
   */
  @computed('args.options.{baselineValue,goalValue}')
  get gauge() {
    return {
      width: 20,
      max: this.args.options.goalValue as number,
      min: this.args.options.baselineValue as number,
      label: {
        extents: (value: number) => {
          let number = this._formatNumber(value),
            prefix = this.prefix,
            unit = this.unit;
          return `${prefix}${number}${unit}`;
        }
      }
    };
  }

  /**
   * @property {Array} - colors to render corresponding to the thresholdValues
   */
  @alias('config.thresholdColors') thresholdColors = ['#f05050', '#ffc831', '#44b876'];

  /**
   * @property {Array} - percentages to render corresponding to the colors
   */
  @alias('config.thresholdPercentages') thresholdPercentages = [75, 85, 100];

  /**
   * @property {Array} - threshold values to indicate what color to render
   * C3 Threshold Algorithm: if < threshold value indexN, use color indexN
   */
  @computed('args.options.{baselineValue,goalValue}')
  get thresholdValues() {
    const { thresholdPercentages: percentages, goalValue: goal, baselineValue: baseline } = this;
    const diff = goal - baseline;

    return percentages.map((p: number) => Number(baseline) + (diff * p) / 100);
  }

  /**
   * @property {Object} - color gauge configuration
   */
  @computed('thresholdValues', 'goalValue')
  get color() {
    return {
      pattern: this.thresholdColors,
      threshold: {
        unit: 'value',
        max: this.goalValue,
        values: this.thresholdValues
      }
    };
  }

  willDestroy() {
    this._removeTitle();
  }
  /**
   * Removes custom gauge title
   * @method _removeTitle
   * @private
   */
  @action _removeTitle() {
    let tspans = d3.selectAll(`.${guidFor(this)}-goal-gauge-widget text.c3-chart-arcs-title > tspan`);
    tspans.remove();
  }

  /**
   * Draws custom gauge title
   * @method _drawTitle
   * @private
   */
  @action _drawTitle() {
    const titleElm = d3.select(`.${guidFor(this)}-goal-gauge-widget text.c3-chart-arcs-title`);
    const { goalValue, baselineValue: baseline } = this.args.options;
    const { metricTitle, actualValue } = this;
    const number = this._formatNumber(actualValue);
    const goal = this._formatNumber(goalValue);
    const prefix = this.prefix || '';
    const unit = this.unit || '';
    const valueClass = actualValue > baseline ? 'pos' : 'neg';

    //Add titles
    titleElm
      .insert('tspan')
      .attr('class', `value-title ${valueClass}`)
      .text(`${prefix}${number}${unit}`)
      .attr('dy', -26)
      .attr('x', 0);

    titleElm
      .insert('tspan')
      .attr('class', 'metric-title')
      .text(metricTitle)
      .attr('dy', 26)
      .attr('x', 0);

    titleElm
      .insert('tspan')
      .attr('class', 'goal-title')
      .text(`${prefix}${goal}${unit} Goal`)
      .attr('dy', 40)
      .attr('x', 0);
  }

  /**
   * Formats numbers for display
   * @method _formatNumber
   * @private
   * @param {Number} value - value to format
   * @returns {String} formatted number
   */
  _formatNumber(value: number) {
    let formatStr = value >= 1000000000 ? '0.[000]a' : '0.[00]a';
    return numeral(value)
      .format(formatStr)
      .toUpperCase();
  }
}

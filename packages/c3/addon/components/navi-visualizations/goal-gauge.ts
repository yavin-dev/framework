/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { readOnly } from '@ember/object/computed';
import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { guidFor } from '@ember/object/internals';
// @ts-ignore
import d3 from 'd3';
import numbro from 'numbro';
import FilterFragment from 'navi-core/models/request/filter';
import { VisualizationModel } from 'navi-core/components/navi-visualizations/table';
import { GoalGaugeConfig } from '@yavin/c3/models/goal-gauge';
import ColumnFragment from 'navi-core/models/request/column';

const DEFAULT_OPTIONS = {
  baselineValue: 0,
  goalValue: 0,
  metricTitle: '',
  metricCid: '',
  prefix: '',
  unit: '',
  thresholdColors: ['#f05050', '#ffc831', '#44b876'],
  thresholdPercentages: [75, 85, 100],
};
export type Args = {
  model: VisualizationModel;
  options: GoalGaugeConfig['metadata'];
};

export default class GoalGaugeVisualization extends Component<Args> {
  /**
   * @property {Array} - List of class names added to the gauge component
   */
  @computed()
  get widgetClassNames() {
    return ['goal-gauge-widget', `${guidFor(this)}-goal-gauge-widget`];
  }

  @computed('args.{model.firstObject.request.metricColumns.[],options.metricCid}')
  get metric(): ColumnFragment | undefined {
    const { request } = this.args.model?.firstObject || {};
    const { metricCid } = this.args.options || {};
    return isPresent(metricCid) ? request?.metricColumns.find(({ cid }) => cid === metricCid) : undefined;
  }

  @computed('metric', 'args.model.firstObject.response.rows.[]')
  get actualValue(): number {
    const { model } = this.args;
    const { metric } = this;
    if (model && metric) {
      const { response } = model?.firstObject || {};
      const firstRow = response?.rows?.[0] || {};
      const { canonicalName } = metric;
      return Number(firstRow[canonicalName]);
    }
    return 0;
  }
  /**
   * @property {object} - target metric model pulled from serialized request
   */
  @readOnly('args.model.firstObject.request.metricColumns.0') metricModel!: FilterFragment;

  /**
   * @property {Object} - legend configuration
   */
  legend = { hide: true };

  /**
   * @property {String} - Display value of goal
   */
  @computed('config.goalValue')
  get formattedGoalValue() {
    return this._formatNumber(this.config.goalValue);
  }

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
  @computed('actualValue')
  get data() {
    return {
      columns: [['data', this.actualValue]],
      type: 'gauge',
    };
  }

  /**
   * @property {Object} - general gauge configuration
   */
  @computed('args.options.{baselineValue,goalValue}', 'config.{prefix,unit}')
  get gauge() {
    return {
      width: 20,
      max: this.args.options.goalValue,
      min: this.args.options.baselineValue,
      label: {
        extents: (value: number) => {
          const number = this._formatNumber(value);
          const prefix = this.config.prefix;
          const unit = this.config.unit;
          return `${prefix}${number}${unit}`;
        },
      },
    };
  }

  /**
   * @property {Array} - threshold values to indicate what color to render
   * C3 Threshold Algorithm: if < threshold value indexN, use color indexN
   */
  @computed('args.options.{baselineValue,goalValue}', 'config.{baselineValue,goalValue,thresholdPercentages}')
  get thresholdValues() {
    const diff = this.config.goalValue - this.config.baselineValue;

    return this.config.thresholdPercentages.map((p: number) => Number(this.config.baselineValue) + (diff * p) / 100);
  }

  /**
   * @property {Object} - color gauge configuration
   */
  @computed('config.{goalValue,thresholdColors}', 'thresholdValues')
  get color() {
    return {
      pattern: this.config.thresholdColors,
      threshold: {
        unit: 'value',
        max: this.config.goalValue,
        values: this.thresholdValues,
      },
    };
  }

  willDestroy() {
    super.willDestroy();
    this._removeTitle();
  }
  /**
   * Removes custom gauge title
   * @method _removeTitle
   * @private
   */
  @action _removeTitle() {
    const tspans = d3.selectAll(`.${guidFor(this)}-goal-gauge-widget text.c3-chart-arcs-title > tspan`);
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
    const { metric, actualValue } = this;
    const number = this._formatNumber(actualValue);
    const goal = this._formatNumber(goalValue);
    const prefix = this.config.prefix || '';
    const unit = this.config.unit || '';
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
      .text(metric?.displayName || '')
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
    const formatObj = {
      mantissa: value > 1000000000 ? 3 : 2,
      trimMantissa: true,
      average: value > 1000,
    };
    return numbro(value).format(formatObj).toUpperCase();
  }
}

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
import Component from '@ember/component';
import { computed, get, getWithDefault } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import numeral from 'numeral';
import d3 from 'd3';
import layout from '../../templates/components/navi-visualizations/goal-gauge';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

const DEFAULT_OPTIONS = {
  baselineValue: 0,
  goalValue: 0,
  metricTitle: '',
  metric: { metric: '', parameters: {} },
  prefix: '',
  unit: '',
  thresholdColors: ['#f05050', '#ffc831', '#44b876'],
  thresholdPercentages: [75, 85, 100]
};

@templateLayout(layout)
@tagName('')
export default class NaviVisualizationsGoalGaugeComponent extends Component {
  @service bardMetadata;
  @service('navi-formatter') naviFormatter;

  /**
   * @property {Array} - List of class names added to the gauge component
   */
  @computed
  get widgetClassNames() {
    return ['goal-gauge-widget', `${guidFor(this)}-goal-gauge-widget`];
  }

  /**
   * @property {Number} - value to be rendered on gauge
   */
  actualValue;

  /**
   * @property {object} - target metric model pulled from serialized request
   */
  @alias('model.firstObject.request.metrics.0') metricModel;

  /**
   * @property {Number} - starting value to measure progress towards the gaol
   */
  @alias('config.baselineValue') baselineValue;

  /**
   * @property {Number} - value which is desired to be achieved
   */
  @alias('config.goalValue') goalValue;

  /**
   * @property {Object} - legend configuration
   */
  legend = { hide: true };

  /**
   * @property {String} - which meta data namespace to use
   */
  @alias('model.firstObject.request.dataSource') namespace;

  /**
   * @property {String} formatted default metric
   */
  @computed('options.metric.{metric,parameters}', 'namespace')
  get defaultMetricTitle() {
    const {
      options: { metric },
      namespace
    } = this;
    const metricMetadata = this.bardMetadata.getById('metric', metric.metric, namespace);
    return this.naviFormatter.formatMetric(metricMetadata, metric.parameters);
  }

  /**
   * @property {String} - The title for the goal metric
   */
  @computed('config.{metricTitle,metric}')
  get metricTitle() {
    return this.config?.metricTitle || this.defaultMetricTitle;
  }

  /**
   * @property {String} - Display value of goal
   */
  @computed('goalValue')
  get formattedGoalValue() {
    return this._formatNumber(this.goalValue);
  }

  /**
   * @property {String} - name of goal metric
   */
  @alias('config.metric') metric;

  /**
   * @property {String} - metric prefix
   */
  @alias('config.prefix') prefix;

  /**
   * @property {String} - metric unit
   */
  @alias('config.unit') unit;

  /**
   * @property {Object} - gauge tooltip configuration
   */
  tooltip = { show: false };

  /**
   * @property {Object} config - config options for the chart
   */
  @computed('options')
  get config() {
    return { ...DEFAULT_OPTIONS, ...this.options };
  }

  /**
   * @property {Object} - gauge data to render
   */
  @computed
  get data() {
    return {
      columns: [['data', this.actualValue]],
      type: 'gauge'
    };
  }

  /**
   * @property {Object} - general gauge configuration
   */
  @computed('options.{baselineValue,goalValue}', 'prefix', 'unit')
  get gauge() {
    return {
      width: 20,
      max: get(this, 'goalValue'),
      min: get(this, 'baselineValue'),
      label: {
        extents: value => {
          let number = this._formatNumber(value),
            prefix = get(this, 'prefix'),
            unit = get(this, 'unit');
          return `${prefix}${number}${unit}`;
        }
      }
    };
  }

  /**
   * @property {Array} - colors to render corresponding to the thresholdValues
   */
  @alias('config.thresholdColors') thresholdColors;

  /**
   * @property {Array} - percentages to render corresponding to the colors
   */
  @alias('config.thresholdPercentages') thresholdPercentages;

  /**
   * @property {Array} - threshold values to indicate what color to render
   * C3 Threshold Algorithm: if < threshold value indexN, use color indexN
   */
  @computed('options.{baselineValue,goalValue}')
  get thresholdValues() {
    const { thresholdPercentages: percentages, goalValue: goal, baselineValue: baseline } = this;
    const diff = goal - baseline;

    return percentages.map(p => Number(baseline) + (diff * p) / 100);
  }

  /**
   * @property {Object} - color gauge configuration
   */
  @computed('thresholdValues', 'goalValue')
  get color() {
    return {
      pattern: get(this, 'thresholdColors'),
      threshold: {
        unit: 'value',
        max: get(this, 'goalValue'),
        values: get(this, 'thresholdValues')
      }
    };
  }

  /**
   * Fires after the element is rendered/rerendered
   * @method didRender
   * @override
   */
  didRender() {
    super.didRender(...arguments);
    this._drawTitle();
  }

  /**
   * Reset actualValue back to its computed value while still allowing
   * the property to be set by the component between renders
   * @method didReceiveAttrs
   * @override
   */
  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    const metric = canonicalizeMetric(get(this, 'config.metric'));
    this.actualValue = get(this, `model.firstObject.response.rows.0.${metric}`);
  }

  /**
   * Fires before the element is rerendered
   * @method willUpdate
   * @override
   */
  willUpdate() {
    super.willUpdate(...arguments);
    this._removeTitle();
  }

  /**
   * Removes custom gauge title
   * @method _removeTitle
   * @private
   */
  _removeTitle() {
    let tspans = d3.selectAll(`.${guidFor(this)}-goal-gauge-widget text.c3-chart-arcs-title > tspan`);
    tspans.remove();
  }

  /**
   * Draws custom gauge title
   * @method _drawTitle
   * @private
   */
  _drawTitle() {
    let titleElm = d3.select(`.${guidFor(this)}-goal-gauge-widget text.c3-chart-arcs-title`),
      metricTitle = get(this, 'metricTitle'),
      goalValue = get(this, 'goalValue'),
      actualValue = get(this, 'actualValue'),
      baseline = get(this, 'baselineValue'),
      number = this._formatNumber(actualValue),
      goal = this._formatNumber(goalValue),
      prefix = getWithDefault(this, 'prefix', ''),
      unit = getWithDefault(this, 'unit', '');

    let valueClass = actualValue > baseline ? 'pos' : 'neg';

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
  _formatNumber(value) {
    let formatStr = value >= 1000000000 ? '0.[000]a' : '0.[00]a';
    return numeral(value)
      .format(formatStr)
      .toUpperCase();
  }
}

/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Note: This component assumes there is only one possible parameter for a metric,
 * this would need to be changed if multiple parameters are supported by the app
 *
 * Usage:
 * {{metric-filter-config
 *   metric=metric
 *   request=request
 *   paramClicked=(action 'paramClicked')
 * }}
 *
 */
import Component from '@ember/component';
import layout from '../templates/components/metric-filter-config';
import { computed } from '@ember/object';
import { A as arr } from '@ember/array';
import { getUnfilteredMetricsOfBase } from 'navi-reports/utils/request-metric';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@tagName('')
@templateLayout(layout)
export default class MetricFilterConfig extends Component {
  /**
   * @property {Array} otherParams - other selected params for the same metric
   */
  @computed('request.{metrics.[],having.[]}', 'metric.{metric,parameters}')
  get otherParams() {
    let unFilteredMetrics = getUnfilteredMetricsOfBase(this.metric.metric, this.request),
      otherParameters = arr(unFilteredMetrics).mapBy('parameters');

    return otherParameters.map(metricParam => {
      let entries = arr(Object.entries(metricParam)).reject(([key]) => key === 'as');
      return entries.map(([, value]) => value);
    });
  }

  /**
   * @property {String} parameter - parameter to configure
   */
  @computed('metric.parameters')
  get parameter() {
    return arr(Object.keys(this.metric.parameters)).reject(key => key === 'as')[0];
  }

  /**
   * @method calculatePosition
   * @returns {Object}
   */
  calculatePosition(trigger) {
    let { top, left, width, height } = trigger.getBoundingClientRect(),
      marginLeft = 25,
      marginTop = 22,
      style = {
        left: left + width + marginLeft,
        top: top + window.pageYOffset + height / 2 - marginTop
      };

    return { style };
  }
}

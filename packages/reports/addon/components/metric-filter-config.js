/**
 * Copyright 2019, Yahoo Holdings Inc.
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
import { computed, get } from '@ember/object';
import { A as arr } from '@ember/array';
import { getUnfilteredMetricsOfBase } from 'navi-reports/utils/request-metric';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['metric-filter-config'],

  /**
   * @property {Array} classNameBindings
   */
  classNameBindings: ['otherParams.length::metric-filter-config__hide'],

  /**
   * @property {Array} otherParams - other selected params for the same metric
   */
  otherParams: computed('request.{metrics.[],having.[]}', 'metric.{metric,parameters}', function() {
    let unFilteredMetrics = getUnfilteredMetricsOfBase(get(this, 'metric.metric'), get(this, 'request')),
      otherParameters = arr(unFilteredMetrics).mapBy('parameters');

    return otherParameters.map(metricParam => {
      let entries = arr(Object.entries(metricParam)).reject(([key]) => key === 'as');
      return entries.map(([, value]) => value);
    });
  }),

  /**
   * @property {String} parameter - parameter to configure
   */
  parameter: computed('metric', function() {
    return arr(Object.keys(get(this, 'metric.parameters'))).reject(key => key === 'as')[0];
  }),

  /**
   * @method calculatePosition
   * @returns {Object} - positioning info used by metric-config
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
});

/**
 * Copyright 2018, Yahoo Holdings Inc.
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
import Ember from 'ember';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: [ 'metric-filter-config' ],

  /**
   * @property {Array} otherParams - other selected params for the same metric
   */
  otherParams: computed('request', 'metric', function() {
    let selectedMetrics = get(this, 'request.metrics').filterBy('metric.name', get(this, 'metric.metric.name')),
        otherMetrics = Ember.A(selectedMetrics).rejectBy('canonicalName', get(this, 'metric.canonicalName')),
        otherParameters = Ember.A(otherMetrics).mapBy('parameters'),
        result = Ember.A([]);

    otherParameters.forEach(metricParam => {
      let entries = Ember.A(Object.entries(metricParam)).reject(([key,]) => key === 'as');
      entries.forEach(([, value]) => {
        result.push( value );
      });
    });

    return result;
  }),

  /**
   * @property {String} parameter - parameter to configure
   */
  parameter: computed('metric', function() {
    return Ember.A(Object.keys(get(this, 'metric.parameters'))).reject(key => key === 'as')[0];
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
          top: top +  window.pageYOffset + (height / 2) - marginTop
        };

    return { style };
  }
});

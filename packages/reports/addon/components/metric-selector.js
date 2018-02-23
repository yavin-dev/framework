/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#metric-selector
 *      request=request
 *      addMetric=(action 'add')
 *      removeMetric=(action 'remove')
 *      addMetricFilter=(action 'addFilter')
 *   }}
 *      {{navi-list-selector}}
 *   {{/metric-selector}}
 */

import Ember from 'ember';
import uniqBy from 'lodash/uniqBy';
import layout from '../templates/components/metric-selector';

const { computed, get } = Ember;

export default Ember.Component.extend({
  layout,

  /*
   * @property {Array} classNames
   */
  classNames: [ 'checkbox-selector', 'checkbox-selector--metric' ],

  /*
   * @property {Array} allMetrics
   */
  allMetrics: computed.readOnly('request.logicalTable.timeGrain.metrics'),

  /*
   * @property {Array} selectedMetrics - selected metrics in the request
   */
  selectedMetrics: computed('request.metrics.[]', function() {
    let metrics = get(this, 'request.metrics').toArray(),
        selectedBaseMetrics = uniqBy(metrics, (metric) => get(metric, 'metric.name'));

    return Ember.A(selectedBaseMetrics).mapBy('metric');
  }),

  /*
   * @property {Object} metricsChecked - object with metric -> boolean mapping to denote
   *                                     if metric checkbox should be checked
   */
  metricsChecked: computed('selectedMetrics', function() {
    return get(this, 'selectedMetrics').reduce((list, metric) => {
      list[get(metric, 'name')] = true;
      return list;
    }, {});
  }),

  /*
   * @property {Object} metricsFiltered - metric -> boolean mapping denoting presence of metric
   *                                         in request havings
   */
  metricsFiltered: computed('request.having.[]', function() {
    return Ember.A(get(this, 'request.having')).mapBy('metric.metric.name').reduce((list, metric) => {
      list[metric] = true;
      return list;
    }, {});
  }),

  actions: {
    /*
     * @action metricClicked
     * @param {Object} metric
     */
    metricClicked(metric) {
      let action = get(this, 'metricsChecked')[get(metric, 'name')]? 'remove' : 'add';
      this.sendAction(`${action}Metric`, metric);
    }
  }
});

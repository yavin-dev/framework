/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#metric-selector
 *      request=request
 *      onAddMetric=(action 'add')
 *      onRemoveMetric=(action 'remove')
 *      onToggleMetricFilter=(action 'addFilter')
 *   }}
 *      {{navi-list-selector}}
 *   {{/metric-selector}}
 */

import Ember from 'ember';
import uniqBy from 'lodash/uniqBy';
import layout from '../templates/components/metric-selector';
import { run } from '@ember/runloop';

const { computed, get } = Ember;

export default Ember.Component.extend({
  layout,

  /*
   * @property {Array} classNames
   */
  classNames: ['checkbox-selector', 'checkbox-selector--metric'],

  /*
   * @property {Array} allMetrics
   */
  allMetrics: computed.readOnly('request.logicalTable.timeGrain.metrics'),

  /*
   * @property {Array} selectedMetrics - selected metrics in the request
   */
  selectedMetrics: computed('request.metrics.[]', function() {
    let metrics = get(this, 'request.metrics').toArray(),
      selectedBaseMetrics = uniqBy(metrics, metric => get(metric, 'metric.name'));

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
    return Ember.A(get(this, 'request.having'))
      .mapBy('metric.metric.name')
      .reduce((list, metric) => {
        list[metric] = true;
        return list;
      }, {});
  }),

  /*
   * @method _openConfig
   * @private
   *
   * Opens the config for the given metric
   * @param metric -
   */
  _openConfig(metricMeta) {
    let longName = get(metricMeta, 'longName');

    //create mousedown event using document.createEvent as supported by all browsers
    let mouseEvent = document.createEvent('MouseEvent');
    mouseEvent.initEvent('mousedown', true, true);

    run(this, () => {
      //find the right config trigger by matching metric longNames
      let metricSelector = document.querySelector('.report-builder__metric-selector'),
        groupedListItems = Array.from(metricSelector.getElementsByClassName('grouped-list__item'));

      groupedListItems.filter(item => {
        if (item.textContent.trim() === longName) {
          item.querySelector('.metric-config__trigger-icon').dispatchEvent(mouseEvent);
        }
      });
    });
  },

  actions: {
    /*
     * @action metricClicked
     * @param {Object} metric
     */
    metricClicked(metric) {
      const action = get(this, 'metricsChecked')[get(metric, 'name')] ? 'Remove' : 'Add';
      const handler = get(this, `on${action}Metric`);

      if (handler) handler(metric);

      //On add, trigger metric-config mousedown event when metric has parameters
      if (action === 'add' && get(metric, 'hasParameters')) {
        this._openConfig(metric);
      }
    }
  }
});

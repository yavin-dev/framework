/**
 * Copyright 2019, Yahoo Holdings Inc.
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

import { A } from '@ember/array';
import Component from '@ember/component';
import { get, computed, action } from '@ember/object';
import { uniqBy } from 'lodash-es';
import layout from '../templates/components/metric-selector';
import { run } from '@ember/runloop';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class MetricSelectorComponent extends Component {
  /*
   * @property {Array} allMetrics
   */
  @computed('request.logicalTable.table.metrics')
  get allMetrics() {
    return A(this.request.logicalTable.table.metrics).sortBy('name');
  }

  /*
   * @property {Array} selectedMetrics - selected metrics in the request
   */
  @computed('request.metrics.[]')
  get selectedMetrics() {
    let metrics = get(this, 'request.metrics').toArray(),
      selectedBaseMetrics = uniqBy(metrics, metric => metric.metric?.id);

    return A(selectedBaseMetrics).mapBy('metric');
  }

  /*
   * @property {Object} metricsChecked - object with metric -> boolean mapping to denote
   *                                     if metric checkbox should be checked
   */
  @computed('selectedMetrics')
  get metricsChecked() {
    return get(this, 'selectedMetrics').reduce((list, metric) => {
      list[get(metric, 'id')] = true;
      return list;
    }, {});
  }

  /*
   * @property {Object} metricsFiltered - metric -> boolean mapping denoting presence of metric
   *                                         in request havings
   */
  @computed('request.having.[]')
  get metricsFiltered() {
    return A(get(this, 'request.having'))
      .mapBy('metric.metric.id')
      .reduce((list, metric) => {
        list[metric] = true;
        return list;
      }, {});
  }

  /*
   * @method _openConfig
   * @private
   *
   * Opens the config for the given metric
   * @param metric -
   */
  _openConfig(metricMeta) {
    let name = get(metricMeta, 'name');

    //create mousedown event using document.createEvent as supported by all browsers
    let mouseEvent = document.createEvent('MouseEvent');
    mouseEvent.initEvent('mousedown', true, true);

    run(this, () => {
      //find the right config trigger by matching metric names
      let metricSelector = document.querySelector('.report-builder__metric-selector'),
        groupedListItems = Array.from(metricSelector.getElementsByClassName('grouped-list__item'));

      groupedListItems.filter(item => {
        if (item.textContent.trim() === name) {
          item.querySelector('.metric-config__trigger-icon').dispatchEvent(mouseEvent);
        }
      });
    });
  }

  /*
   * @action metricClicked
   * @param {Object} metric
   */
  @action
  metricClicked(metric) {
    const enableRequestPreview = featureFlag('enableRequestPreview'),
      actionName = !enableRequestPreview && get(this, 'metricsChecked')[get(metric, 'id')] ? 'Remove' : 'Add',
      handler = this[`on${actionName}Metric`];

    if (handler) handler(metric);

    //On add, trigger metric-config mousedown event when metric has parameters
    if (actionName === 'Add' && get(metric, 'hasParameters') && !enableRequestPreview) {
      this._openConfig(metric);
    }
  }
}

export default MetricSelectorComponent;

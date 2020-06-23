/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <MetricConfig
 *      @metric={{this.metric}}
 *      @onRequest={{this.request}}
 *      @onAddParameterizedMetric={{this.addParameterizedMetric}}
 *      @onRemoveParameterizedMetric={{this.removeParameterizedMetric}}
 *      @onToggleParameterizedMetricFilter={{this.toggleParameterizedMetricFilter}}
 *   />
 */
import Component from '@ember/component';
import layout from '../templates/components/metric-config';
import { inject as service } from '@ember/service';
import { computed, get, set, action } from '@ember/object';
import { A as arr } from '@ember/array';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';

@tagName('')
@templateLayout(layout)
export default class MetricConfig extends Component {
  /**
   * @property {Service} parameterService - metric parameter service
   */
  @service('metric-parameter')
  parameterService;

  /**
   * @method calculatePosition
   * @returns {Object} - positioning info used by ember-basic-dropdown
   */
  calculatePosition(trigger, content) {
    let { top, left, width, height } = trigger.getBoundingClientRect(),
      { height: contentHeight } = content.getBoundingClientRect(),
      margin = 15,
      style = {
        left: left + width + margin,
        top: top + window.pageYOffset + height / 2 - contentHeight + margin
      };

    return { style };
  }

  /**
   * @observer _fetchAllParams
   * creates a hash of promises for all metric parameter values and sets the appropriate properties
   */
  @observes('metric')
  _fetchAllParams() {
    const fetchParamsPromise = this.parameterService.fetchAllParams(this.metric);

    set(this, 'parametersPromise', fetchParamsPromise);
    fetchParamsPromise.then(result => {
      set(this, 'allParametersMap', result);
      set(this, 'allParameters', Object.values(result));
    });
  }

  /**
   * @property {Object} allParametersMap - parameters map of param type and id to parameter object
   * Ex: {
   *    'currency|USD' : { id: USD, name: Dollars, param: 'currency' }
   *    ...
   *  }
   */
  allParametersMap;

  /**
   * @property {Array} allParameters - parameter value array
   */
  allParameters;

  /**
   * @property {Array} selectedParams - selected param objects
   */
  @computed('request.metrics.[]', 'metric', 'allParametersMap')
  get selectedParams() {
    let selectedMetrics = arr(get(this, 'request.metrics')).filterBy('metric', get(this, 'metric')),
      selectedMetricParams = arr(selectedMetrics).mapBy('parameters'),
      allParametersMap = get(this, 'allParametersMap') || {};

    return selectedMetricParams
      .map(param => {
        //delete alias key in copy
        let paramCopy = Object.assign({}, param);
        delete paramCopy.as;
        const paramEntries = Object.entries(paramCopy);

        //see if they have parameters at all
        if (paramEntries.length === 0) {
          return false;
        }

        //fetch from map
        let [key, value] = paramEntries[0];
        return allParametersMap[`${key}|${value}`];
      })
      .filter(e => !!e); //filter out bad or outdated parameters
  }

  /**
   * @property {Array} parametersChecked - list of all parameters checked
   */
  @computed('selectedParams')
  get parametersChecked() {
    return get(this, 'selectedParams').reduce((list, param) => {
      list[`${get(param, 'param')}|${get(param, 'id')}`] = true;
      return list;
    }, {});
  }

  /**
   * @property {Object} paramsFiltered - having -> boolean mapping denoting presence of metric param
   *                                         in request havings
   */
  @computed('request.having.[]', 'metric')
  get paramsFiltered() {
    return arr(get(this, 'request.having'))
      .filterBy('metric.metric.id', this.metric?.id)
      .reduce((list, having) => {
        let paramArray = Object.entries(get(having, 'metric.parameters')).filter(([key]) => key.toLowerCase() !== 'as');

        paramArray.forEach(([key, val]) => {
          list[`${key}|${val}`] = true;
        });

        return list;
      }, {});
  }

  /**
   * @action Call the supplied handler to add the metric with param and focus the clicked button
   * @param {Function} handler
   * @param {String} metric
   * @param {Object} param
   * @param {Element} target
   */
  doParamToggled(handler, metric, param, target) {
    target && target.focus();
    handler(metric, { [param.param]: param.id });
  }

  /**
   * @action triggerFetch
   * trigger parameter value fetch
   */
  @action
  triggerFetch() {
    this._fetchAllParams();
  }

  /**
   * @action paramToggled - throttle the adding of metrics when requestPreview is enabled
   * @param {Object} metric
   * @param {Object} param
   */
  @action
  paramToggled(metric, param) {
    const actionName = this.parametersChecked[`${param.param}|${param.id}`] ? 'Remove' : 'Add';
    const handler = this[`on${actionName}ParameterizedMetric`];

    if (handler) {
      this.doParamToggled(handler, metric, param, null);
    }
  }

  /**
   * @action paramFilterToggled
   * @param {Object} metric
   * @param {Object} param
   */
  @action
  paramFilterToggled(metric, param) {
    const handler = get(this, 'onToggleParameterizedMetricFilter');

    if (handler) handler(metric, { [get(param, 'param')]: get(param, 'id') });
  }
}

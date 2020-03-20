/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{metric-config
 *      metric=metric
 *      onRequest=request
 *      onAddParameterizedMetric=(action 'addParameterizedMetric')
 *      onRemoveParameterizedMetric=(action 'removeParameterizedMetric')
 *      onToggleParameterizedMetricFilter=(action 'toggleParameterizedMetricFilter')
 *   }}
 */
import Component from '@ember/component';
import layout from '../templates/components/metric-config';
import { inject as service } from '@ember/service';
import { computed, get, observer, set } from '@ember/object';
import { A as arr } from '@ember/array';
import { featureFlag } from 'navi-core/helpers/feature-flag';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['metric-config'],

  /**
   * @property {Service} parameterService - metric parameter service
   */
  parameterService: service('metric-parameter'),

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
  },

  /**
   * @observer _fetchAllParams
   * creates a hash of promises for all metric parameter values and sets the appropriate properties
   */
  _fetchAllParams: observer('metric', function() {
    const fetchParamsPromise = this.parameterService.fetchAllParams(this.metric);

    set(this, 'parametersPromise', fetchParamsPromise);
    fetchParamsPromise.then(result => {
      set(this, 'allParametersMap', result);
      set(this, 'allParameters', Object.values(result));
    });
  }),

  /**
   * @property {Object} allParametersMap - parameters map of param type and id to parameter object
   * Ex: {
   *    'currency|USD' : { id: USD, name: Dollars, param: 'currency' }
   *    ...
   *  }
   */
  allParametersMap: undefined,

  /**
   * @property {Array} allParameters - parameter value array
   */
  allParameters: undefined,

  /**
   * @property {Array} selectedParams - selected param objects
   */
  selectedParams: computed('request.metrics.[]', 'metric', 'allParametersMap', function() {
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
  }),

  /**
   * @property {Array} parametersChecked - list of all parameters checked
   */
  parametersChecked: computed('selectedParams', function() {
    return get(this, 'selectedParams').reduce((list, param) => {
      list[`${get(param, 'param')}|${get(param, 'id')}`] = true;
      return list;
    }, {});
  }),

  /*
   * @property {Object} paramsFiltered - having -> boolean mapping denoting presence of metric param
   *                                         in request havings
   */
  paramsFiltered: computed('request.having.[]', 'metric', function() {
    return arr(get(this, 'request.having'))
      .filterBy('metric.metric.name', get(this, 'metric.name'))
      .reduce((list, having) => {
        let paramArray = Object.entries(get(having, 'metric.parameters')).filter(([key]) => key.toLowerCase() !== 'as');

        paramArray.forEach(([key, val]) => {
          list[`${key}|${val}`] = true;
        });

        return list;
      }, {});
  }),

  actions: {
    /*
     * @action triggerFetch
     * trigger parameter value fetch
     */
    triggerFetch() {
      this._fetchAllParams();
    },

    /*
     * @action paramToggled
     * @param {Object} metric
     * @param {Object} param
     */
    paramToggled(metric, param) {
      const enableRequestPreview = featureFlag('enableRequestPreview');
      const action = !enableRequestPreview && this.parametersChecked[`${param.param}|${param.id}`] ? 'Remove' : 'Add';
      const handler = this[`on${action}ParameterizedMetric`];

      if (handler) handler(metric, { [param.param]: param.id });
    },

    /*
     * @action paramFilterToggled
     * @param {Object} metric
     * @param {Object} param
     */
    paramFilterToggled(metric, param) {
      const handler = get(this, 'onToggleParameterizedMetricFilter');

      if (handler) handler(metric, { [get(param, 'param')]: get(param, 'id') });
    }
  }
});

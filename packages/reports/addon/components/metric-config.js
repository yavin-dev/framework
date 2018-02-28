/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{metric-config
 *      metric=metric
 *      request=request
 *      addParameterizedMetric=(action 'addParameterizedMetric')
 *      removeParameterizedMetric=(action 'removeParameterizedMetric')
 *      toggleParameterizedMetricFilter=(action 'toggleParameterizedMetricFilter')
 *   }}
 */
import Component from '@ember/component';
import layout from '../templates/components/metric-config';
import { inject as service } from '@ember/service';
import { computed, get, observer, set } from '@ember/object';
import { A as arr } from '@ember/array';
import { hash } from 'rsvp';
import forIn from 'lodash/forIn';

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
   * @method init
   * @override
   */
  init() {
    this._super(...arguments);
    this._fetchAllParams();
  },

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
          top: top +  window.pageYOffset + (height / 2) - contentHeight + margin
        };

    return { style };
  },

  /**
   * @observer _fetchAllParams
   * creates a hash of promises for all metric parameter values and sets the appropriate properties
   */
  _fetchAllParams: observer('metric', function() {
    let promises = {},
        parameterObj = get(this, 'metric.parameters') || {},
        parameters = arr(Object.entries(parameterObj)).filter(
          ([ , paramMeta ]) => get(paramMeta, 'type') === 'dimension'
        ),
        allParametersMap = {},
        allParamValues = [];

    parameters.forEach(([ paramType, paramMeta]) => {
      promises[paramType] = get(this, 'parameterService').fetchAllValues(paramMeta);
    });

    let promiseHash = hash(promises).then(res => {
      //add property param to every element in each array
      forIn(res, (values, key) => {
        let valArray = values.toArray();
        valArray.forEach(val => {
          set(val, 'param', key);

          //add object to map
          allParametersMap[`${key}|${val.id}`] = val;
        });

        allParamValues.push(...valArray);
      });

      set(this, 'allParametersMap', allParametersMap);
      set(this, 'allParameters', allParamValues);
    });

    set(this, 'parametersPromise', promiseHash)
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

    return selectedMetricParams.map(param => {
      //delete alias key in copy
      let paramCopy = Object.assign({}, param);
      delete paramCopy.as;

      //fetch from map
      let [key, value] = Object.entries(paramCopy)[0];
      return allParametersMap[`${key}|${value}`];
    })
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
        let paramArray = Object.entries(get(having, 'metric.parameters'))
          .filter(([key, ]) => key.toLowerCase() !== 'as');

        paramArray.forEach(([key, val]) => {
          list[`${key}|${val}`] = true;
        });

        return list;
      }, {});
  }),

  actions: {
    /*
     * @action paramToggled
     * @param {Object} metric
     * @param {Object} param
     */
    paramToggled(metric, param) {
      let action = get(this, 'parametersChecked')[`${get(param, 'param')}|${get(param, 'id')}`]? 'remove' : 'add';
      this.sendAction(`${action}ParameterizedMetric`, metric, { [get(param, 'param')]: get(param, 'id') });
    },

    /*
     * @action paramFilterToggled
     * @param {Object} metric
     * @param {Object} param
     */
    paramFilterToggled(metric, param) {
      this.sendAction('toggleParameterizedMetricFilter', metric, { [get(param, 'param')]: get(param, 'id') });
    }
  }
});

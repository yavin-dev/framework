/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Metric Component
 *
 * Usage:
 *  <NaviColumnConfig::Metric
 *    @column={{editingColumn}}
 *    @metadata={{visualization.metadata}}
 *    @onClose={{action "onClose"}}
 *    @onUpdateColumnName={{action "onUpdateColumnName"}}
 *  />
 */
import Component from '@ember/component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/navi-column-config/metric';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { groupBy } from 'lodash-es';

@tagName('')
@templateLayout(layout)
class NaviColumnConfigMetricComponent extends Component {
  /**
   * @service
   */
  @service('metric-parameter') parameterService;

  /**
   * @property {String} _previousMetricName - the name of the last fetched metric
   */
  _previousMetricName = null;

  /**
   * @property {String} classId - a unique id for this instance of the column config
   */
  get classId() {
    return guidFor(this);
  }

  /**
   * @property {Array} metricParameters - Returns a list of the metrics parameters or empty if there are none
   */
  @computed('column.fragment.metric.parameters.{}')
  get metricParameters() {
    const { metric } = this.column.fragment;
    if (!metric.hasParameters) {
      return [];
    }
    return metric.arguments.map(arg => arg.id);
  }

  /**
   * @property {Promise} currentParameter - Returns promise that returns parameter object of the currently applied parameter
   */
  @computed('column.fragment.parameters.{}', 'allParameters')
  get currentParameters() {
    const { metricParameters, allParameters } = this;
    const selectedParamIds = this.column.fragment.parameters || {};

    return allParameters.then(vals => {
      const selected = metricParameters.reduce((selectedParams, paramId) => {
        selectedParams[paramId] = vals[paramId].find(param => param.id === selectedParamIds[paramId]);
        return selectedParams;
      }, {});

      return selected;
    });
  }

  /**
   * @property {Promise} - A promise to an object of parameter to its list of values for the given metric
   */
  @computed('column.fragment.metric')
  get allParameters() {
    const { metric } = this.column.fragment;
    if (!metric.hasParameters) {
      return Promise.resolve({});
    }

    return this.parameterService
      .fetchAllParams(metric)
      .then(result => groupBy(Object.values(result), paramValue => paramValue.param));
  }

  /**
   * @action
   * @param {Object} param - parameter object to be added to the metric
   */
  @action
  updateMetricParam(param) {
    const { fragment: metricFragment } = this.column;

    this.onUpdateMetricParam(metricFragment, param.id, param.param);
  }
}

export default NaviColumnConfigMetricComponent;

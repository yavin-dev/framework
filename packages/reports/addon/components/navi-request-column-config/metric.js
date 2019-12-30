/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Metric Component
 *
 * Usage:
 *  <NaviRequestColumnConfig::Metric
 *    @column={{editingColumn}}
 *    @metadata={{visualization.metadata}}
 *    @onClose={{action "onClose"}}
 *    @onUpdateColumnName={{action "onUpdateColumnName"}}
 *  />
 */
import Component from '@ember/component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/navi-request-column-config/metric';
import { action, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';

@tagName('')
@templateLayout(layout)
class Metric extends Component {
  /**
   * @service
   */
  @service('metric-parameter') parameterService;

  /**
   * @override
   * @method init
   */
  init() {
    super.init(...arguments);
    this._previousMetric = null;
    this._parametersPromise = null;
  }

  /**
   * @override
   * @method didReceiveAttrs
   */
  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    const { metric, canonicalName } = this.column.fragment;
    const prevMetricName = this._previousMetricName;

    if (!prevMetricName || canonicalName !== prevMetricName) {
      this._fetchParameters(metric);
    }

    this._previousMetricName = canonicalName;
  }

  /**
   * @property {Promise} currentParameter - Returns promise that returns parameter object of the currently applied parameter
   */
  @computed('column.fragment.parameters.{}', 'allParameters')
  get currentParameter() {
    const params = this.column.fragment.parameters || {};
    const paramId = Object.keys(params).find(key => key !== 'as' && params[key]);
    const loadedParamVals = this.allParameters;

    if (!paramId) {
      return null;
    }

    return loadedParamVals.then(vals => vals.find(param => param.param === paramId && param.id === params[paramId]));
  }

  /**
   * @private
   * @method _fetchParameters - fetch all parameter values for a given metric
   * @param {Object} metric - metric meta data object
   */
  _fetchParameters(metric) {
    if (!metric.hasParameters) {
      this.set('allParameters', null);
      return;
    }

    set(
      this,
      'allParameters',
      this.parameterService.fetchAllParams(metric).then(result => {
        return Object.values(result);
      })
    );
  }

  /**
   * @action
   * @param {Object} param - parameter object to be added to the metric
   */
  @action
  updateMetricParam(param) {
    const visMetadata = this.get('metadata.style.aliases');
    const oldMetricName = this.column.fragment.canonicalName;

    this.onUpdateMetricParam(oldMetricName, param.id, param.param);

    const newMetricName = this.column.fragment.canonicalName;

    if (Array.isArray(visMetadata)) {
      const existingAlias = visMetadata.find(alias => alias.name === oldMetricName);

      if (existingAlias) {
        existingAlias.name = newMetricName;
      }
    }
  }
}

export default Metric;

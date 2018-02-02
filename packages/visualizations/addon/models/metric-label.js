/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationBase from './visualization';
import MetricLabelConfig from '../components/visualization-config/metric-label';
import { buildValidations, validator } from 'ember-cp-validations';
import Ember from 'ember';
import DS from 'ember-data';

const { computed, set, get } = Ember;

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations({

  //Selected metric list is the same as request metric list
  'metadata.metric': validator('request-metric-exist')

}, {
  //Global Validation Options
  request: computed.readOnly('model._request')
});

export default VisualizationBase.extend(Validations, {
  type:     DS.attr('string', { defaultValue: 'metric-label'}),
  version:  DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({ defaultValue: () => {
    return { };
  }}),

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request /*response*/) {
    let metrics = Ember.A( get(request, 'metrics') ),
        metric =  get(metrics, 'firstObject.metric.name'),
        description =  get(metrics, 'firstObject.metric.longName'),
        allFormats = get(MetricLabelConfig.proto(), 'predefinedFormats'),
        format = get(this, 'metadata.format') || get(allFormats[0], 'format');

    set(this, 'metadata', { metric, description, format });
    return this;
  }
});

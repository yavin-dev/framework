/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { readOnly } from '@ember/object/computed';
import { A } from '@ember/array';
import { set } from '@ember/object';
import VisualizationBase from './visualization';
import { buildValidations, validator } from 'ember-cp-validations';
import DS from 'ember-data';
import { getOwner } from '@ember/application';
import NumberFormats from 'navi-core/utils/enums/number-formats';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    //Selected metric list is the same as request metric list
    'metadata.metric': validator('request-metric-exist')
  },
  {
    //Global Validation Options
    request: readOnly('model._request')
  }
);

export default VisualizationBase.extend(Validations, {
  type: DS.attr('string', { defaultValue: 'metric-label' }),
  version: DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({
    defaultValue: () => {
      return {};
    }
  }),

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request /*response*/) {
    const metrics = A(request.metrics);
    const metric = metrics.firstObject.toJSON();
    const description = getOwner(this)
      .lookup('service:navi-formatter')
      .formatMetric(metrics.firstObject, metrics.firstObject?.metric?.name);
    const allFormats = NumberFormats;
    const format = this.metadata.format || allFormats[0]?.format;

    set(this, 'metadata', { metric, description, format });
    return this;
  }
});

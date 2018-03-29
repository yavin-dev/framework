/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { computed, get, set} from '@ember/object';
import { A as arr } from '@ember/array';
import DS from 'ember-data';
import VisualizationBase from './visualization';
import { buildValidations, validator } from 'ember-cp-validations';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations({
  //Selected metric list  is the same as request metric list
  'metadata.metric': validator('request-metric-exist'),
  'metadata.baselineValue': validator('number', { allowString: true }),
  'metadata.goalValue': validator('number', { allowString: true })
}, {
  //Global Validation Options
  request: computed.readOnly('model._request')
});

export default VisualizationBase.extend(Validations, {
  type:     DS.attr('string', { defaultValue: 'goal-gauge'}),
  version:  DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({ defaultValue: () => {
    return {
      metric: null,
      baselineValue: null,
      goalValue: null,
      metricTitle: null,
      unit: null,
      prefix: null
    };
  }}),

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request, response) {

    if (request && response) {
      let metrics = arr( get(request, 'metrics') ),
          metric =  get(metrics, 'firstObject.canonicalName'),
          actualValue =  get(arr(response.rows), `firstObject.${metric}`),
          above = actualValue * 1.1,
          below = actualValue * 0.9,
          baselineValue =  actualValue > 0 ? below : above,
          goalValue =  actualValue > 0 ? above : below;

      //handle the zero value case
      if (actualValue  === 0) {
        baselineValue = 0;
        goalValue = 1;
      }

      set(this, 'metadata', { baselineValue, goalValue, metric });
    }
    return this;
  }
});

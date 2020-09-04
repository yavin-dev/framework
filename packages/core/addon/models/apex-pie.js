/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import { computed, set } from '@ember/object';
import VisualizationBase from './visualization';
import { buildValidations } from 'ember-cp-validations';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {},
  {
    //Global Validation Options
    request: computed.readOnly('model._request')
  }
);

export default VisualizationBase.extend(Validations, {
  type: DS.attr('string', { defaultValue: 'apex-pie' }),
  version: DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({
    defaultValue: () => {
      return {
        series: {
          type: null,
          config: {}
        }
      };
    }
  }),

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {Object} request - request object
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request, response) {
    this.isValidForRequest(request);
    /*
    RETURNS:
    series: {
      type: string,
      config: {
        colors: [{ color: 'string', label: 'string' } ...]
      }
    }
    */
    let meta = {
      series: {
        config: {
          colors: this.getWithDefault('metadata.series.config.colors', [])
        }
      }
    };
    set(this, 'metadata', meta);
    return this;
  }
});

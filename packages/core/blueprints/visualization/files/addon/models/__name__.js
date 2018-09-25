/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import VisualizationBase from './visualization';
import { buildValidations } from 'ember-cp-validations';

const { computed, set } = Ember;

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    //TODO define whether metadata is valid based on request
  },
  {
    //Global Validation Options
    request: computed.readOnly('model._request')
  }
);

export default VisualizationBase.extend(Validations, {
  type: DS.attr('string', { defaultValue: '<%= dasherizedModuleName %>' }),
  version: DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({
    defaultValue: () => {
      // TODO define default visualization config settings
      return {};
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
  rebuildConfig(/*request , response */) {
    // TODO build a valid config based on request + response
    set(this, 'metadata', {});

    return this;
  }
});

/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { set, get } from '@ember/object';
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import RequestFragment from './bard-request-v2/request';

//TODO Try to make this an abstract class
export default class VisualizationFragment extends Fragment {
  @attr('string')
  type!: string;

  @attr('number')
  version!: number;

  @attr()
  metadata: unknown;

  /**
   * @property {Object} - temporary request object used for validation
   */
  _request!: RequestFragment;

  /**
   * Test if the config is valid for the given request
   *
   * @method isValidForRequest
   * @param {Object} request - request object
   * @return {Boolean} - is the config valid
   */
  isValidForRequest(request: RequestFragment) {
    set(this, '_request', request);
    //TODO Add validation mixin
    //@ts-ignore
    this.validateSync();
    //@ts-ignore
    return get(this, 'validations.isValid');
  }

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(_request: RequestFragment, _response: TODO) {
    /*
     * TODO: Enable this after figuring out the reason for ember-cp-validations failing
     * Ember.assert(`rebuildConfig is not implemented in ${this.constructor.modelName}`);
     */
  }
}

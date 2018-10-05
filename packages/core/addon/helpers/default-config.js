/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Returns the default config for a given visualization.
 *
 * Usage:
 *  {{navi-visualizations/bar-chart
 *    model=(array model)
 *    options=(default-config 'bar-chart' model.request model.response)
 *  }}
 */
import Ember from 'ember';

export default Ember.Helper.extend({
  /**
   * @property {Ember.Service} store
   */
  store: Ember.inject.service(),

  /**
   * @method compute
   * @param {Array} params - the positional arguments to the helper
   * @param {String} params.0 - visualizationName, ex: 'bar-chart'
   * @param {MF.Fragment} params.1 - request model fragment used to generate response
   * @param {Object} params.2 - response from navi-data fact service
   * @override
   * @returns {Object} configuration object that is valid for the given arguments
   */
  compute([visualizationName, request, response]) {
    // Make sure there is a model for the given visualizationName
    Ember.assert(
      `Default config can not be made since model:${visualizationName} was not found`,
      Ember.getOwner(this).hasRegistration(`model:${visualizationName}`)
    );

    // Use the visualization model fragment to build a valid config
    let store = this.get('store'),
      visualizationFragment = store.createFragment(visualizationName).rebuildConfig(request, response);

    return visualizationFragment.get('metadata');
  }
});

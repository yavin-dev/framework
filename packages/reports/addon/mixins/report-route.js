/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    /**
     * @action didUpdateVisualization
     * @param {Object} metadata - config data for current visualization
     */
    didUpdateVisualization(metadata) {
      Ember.set(this, 'currentModel.visualization', metadata);
    }
  }
});

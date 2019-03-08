/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { set } from '@ember/object';

import Mixin from '@ember/object/mixin';

export default Mixin.create({
  actions: {
    /**
     * @action didUpdateVisualization
     * @param {Object} metadata - config data for current visualization
     */
    didUpdateVisualization(metadata) {
      set(this, 'currentModel.visualization', metadata);
    }
  }
});

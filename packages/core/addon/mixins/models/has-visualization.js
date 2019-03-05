/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { on } from '@ember/object/evented';

import Mixin from '@ember/object/mixin';
import { set, get } from '@ember/object';
import { fragment } from 'ember-data-model-fragments/attributes';

export default Mixin.create({
  visualization: fragment('visualization', { polymorphic: true }),

  /**
   * Caches the persisted visualization type
   *
   * @method _cachePersistedVisualization
   * @private
   */
  _cachePersistedVisualization: on('didCreate', 'didUpdate', 'didLoad', function() {
    set(this, '_persistedVisualization', get(this, 'visualization'));
  }),

  /**
   * Removes any local modifications
   *
   * @method rollbackAttributes
   * @override
   */
  rollbackAttributes() {
    /*
     *Note: Due to issues with rolling back polymorphic fragments,
     *set the persisted visualization, then rollback
     */
    let persistedVisualization = get(this, '_persistedVisualization');
    if (persistedVisualization) {
      set(this, 'visualization', persistedVisualization);
    }

    this._super();
  }
});

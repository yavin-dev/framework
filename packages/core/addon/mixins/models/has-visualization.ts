/* eslint-disable ember/no-new-mixins */
/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Mixin from '@ember/object/mixin';
import { get, set } from '@ember/object';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import VisualizationFragment from 'navi-core/models/visualization';

type PersistedVisualization = VisualizationFragment | undefined;

export default Mixin.create({
  visualization: fragment('visualization', { polymorphic: true }) as VisualizationFragment,
  _persistedVisualization: undefined as PersistedVisualization,

  /**
   * Caches the persisted visualization type
   *
   * @method _cachePersistedVisualization
   * @private
   */
  _cachePersistedVisualization() {
    set(this, '_persistedVisualization', get(this, 'visualization'));
  },

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
  },

  /**
   * @method didCreate
   * @override
   */
  didCreate() {
    this._cachePersistedVisualization();
  },

  /**
   * @method didUpdate
   * @override
   */
  didUpdate() {
    this._cachePersistedVisualization();
  },

  /**
   * @method didLoad
   * @override
   */
  didLoad() {
    this._cachePersistedVisualization();
  }
});

/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Mixin from '@ember/object/mixin';
import { set } from '@ember/object';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import { isEqual } from 'lodash-es';
import type { FragmentRegistry, VisualizationType } from 'navi-core/models/registry';
import type YavinVisualizationModel from 'navi-core/models/visualization-v2';
import type RequestFragment from 'navi-core/models/request';

type PersistedVisualization = FragmentRegistry[VisualizationType] | undefined;

export default Mixin.create({
  visualization: fragment('visualization-v2', { polymorphic: true }) as FragmentRegistry[VisualizationType],
  _persistedVisualization: undefined as PersistedVisualization,

  /**
   * TODO: Temporary fix for updating visualizations so that they go through the polymorphic route
   * to instantiate the correct model (and validations) as well as update the request for use in validations.
   * @param newVisualization new visualization model to update with
   * @param request current request fragment
   */
  updateVisualization(newVisualization: YavinVisualizationModel) {
    const { visualization } = this;

    if (newVisualization.typeName === visualization?.typeName) {
      if (!isEqual(visualization.metadata, newVisualization.metadata)) {
        //@ts-ignore
        visualization.metadata = newVisualization.metadata;
      }
    } else {
      //@ts-ignore
      this.visualization = null;
      //@ts-ignore
      this.visualization = newVisualization.serialize();
    }
    //@ts-ignore
    const request = this.request as RequestFragment;
    if (request) {
      set(this.visualization, '_request', request);
    }
  },

  /**
   * Caches the persisted visualization type
   *
   * @method _cachePersistedVisualization
   * @private
   */
  _cachePersistedVisualization() {
    set(this, '_persistedVisualization', this.visualization);
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
    let persistedVisualization = this._persistedVisualization;
    if (persistedVisualization) {
      //@ts-ignore - pass serialized in to allow polymorphic creation of legacy fragments
      this.visualization = persistedVisualization.serialize();
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
    this._super(...arguments);
    this._cachePersistedVisualization();
  },

  /**
   * @method didLoad
   * @override
   */
  didLoad() {
    this._cachePersistedVisualization();
  },
});

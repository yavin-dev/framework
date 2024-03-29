/* eslint-disable ember/no-new-mixins */
/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Mixin from '@ember/object/mixin';
import { set } from '@ember/object';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import { isEqual } from 'lodash-es';
import VisualizationModelV2 from 'navi-core/models/visualization-v2';
import type { FragmentRegistry, VisualizationType } from 'navi-core/models/registry';
import type RequestFragment from 'navi-core/models/request';
import type YavinVisualizationModel from 'navi-core/visualization/model';

type PersistedVisualization = FragmentRegistry[VisualizationType] | VisualizationModelV2 | undefined;

export default Mixin.create({
  visualization: fragment('visualization', { polymorphic: true, typeKey: 'vizModelType' }) as
    | FragmentRegistry[VisualizationType]
    | VisualizationModelV2,
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
      // Only update if there are changes so it doesn't look like the visualization changes needs to be saved
      if (!isEqual(visualization.metadata, newVisualization.metadata)) {
        //@ts-ignore
        visualization.metadata = newVisualization.metadata;
      }
    } else {
      //@ts-ignore
      this.visualization = newVisualization;
    }
    //@ts-ignore
    const request = this.request as RequestFragment;
    if (request) {
      // update the visualization (only needed for legacy) to have the latest request for use in validations
      //@ts-ignore
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
      this.updateVisualization(persistedVisualization);
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

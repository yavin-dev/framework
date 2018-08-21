/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Mixin.create({
  /**
   * @property {Service} router
   */
  router: service(),

  actions: {
    /**
     * @action buildUrl
     * @param {DS.Model} item - report or dashboard model with id
     * @returns {String} url for given model
     */
    buildUrl(model) {
      let modelId = get(model, 'id'),
          modelType = get(model, 'constructor.modelName'),
          baseUrl = document.location.origin,
          modelUrl = get(this, 'router').urlFor(`${modelType}s.${modelType}`, modelId);

      return baseUrl + modelUrl;
    }
  }
});

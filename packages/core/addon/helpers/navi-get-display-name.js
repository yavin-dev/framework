/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';
import { get } from '@ember/object';

export default Helper.extend({
  /**
   * @property {Ember.Service}
   */
  metadata: service('bard-metadata'),

  /**
   * @method compute
   * @override
   * @param {Array} params
   * @param {String} params.0 - metadata type
   * @param {String} params.1 - metadata object id
   * @returns {String} display name from metadata
   */
  compute([type, id]) {
    /*
     * Since the helper can be used before data is ready, like in chart tooltips,
     * we need to gracefully handle undefined ids
     */
    if (!id) {
      return undefined;
    }

    let metadataModel = get(this, 'metadata').getById(type, id);
    assert(`No ${type} found for id: ${id}`, metadataModel);
    return metadataModel.name;
  }
});

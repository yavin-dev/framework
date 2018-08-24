/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

const { get } = Ember;

export default Ember.Helper.extend({
  /**
   * @property {Ember.Service}
   */
  metadata: Ember.inject.service('bard-metadata'),

  /**
   * @method compute
   * @override
   * @param {Array} params
   * @param {String} params.0 - metadata type
   * @param {Array} params.1 - list of metadata object ids
   * @returns {String} display names from metadata joined by ','
   */
  compute([type, ids]) {
    /*
     * Since the helper can be used before data is ready, like in chart tooltips,
     * we need to gracefully handle undefined ids
     */
    if (!ids) {
      return undefined;
    }

    let metadataService = get(this, 'metadata'),
        lookupMetadata = id => metadataService.getById(type, id),
        metadataDisplayNames = ids.map(id => {
          let metadataModel = lookupMetadata(id);
          Ember.assert(`No ${type} found for id: ${id}`, metadataModel);
          return get(metadataModel, 'longName');
        });

    return metadataDisplayNames.join(', ');
  }
});

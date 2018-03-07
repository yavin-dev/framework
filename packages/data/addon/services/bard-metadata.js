/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that helps retrieve metadata from WS
 */

import Ember from 'ember';

const { assign, get, getOwner, setOwner, getWithDefault } = Ember;

export default Ember.Service.extend({
  /**
   * @private
   * @property {Object} adapter - the adapter object
   */
  _adapter: undefined,

  /**
   * @private
   * @property {Object} serializer - the serializer object
   */
  _serializer: undefined,

  /**
   * @private
   * @property {Ember.Service} _keg - keg service
   */
  _keg: Ember.inject.service('keg'),

  /**
   * @property {Boolean} metadataLoaded
   */
  metadataLoaded: false,

  /**
   * @method init
   */
  init() {
    this._super(...arguments);

    //Instantiating the bard metadata adapter & serializer
    let owner = getOwner(this),
        adapter = owner.lookup('adapter:bard-metadata');

    this.set('_adapter', adapter);
    this.set('_serializer', owner.lookup('serializer:bard-metadata'));
  },

  /**
   * @method loadMetadata
   * Fetches metadata from the bard WS using the metadata adapter and loads into keg
   *
   * @param {Object} options - options object used by the adapter
   * @returns {Promise} promise that loads metadata
   */
  loadMetadata(options) {
    //fetch metadata from WS if metadata not yet loaded
    if(!get(this, 'metadataLoaded')){
      return get(this, '_adapter').fetchAll('table', assign({
        query: {format: 'fullview'}
      }, options)).then((payload) => {
        //normalize payload
        let metadata =  get(this, '_serializer').normalize(payload);

        //set metadataLoaded property
        if ( !(get(this, 'isDestroyed') || get(this, 'isDestroying')) ) {
          //create metadata model objects and load into keg
          this._loadMetadataForType('table', metadata.tables);
          this._loadMetadataForType('dimension', metadata.dimensions);
          this._loadMetadataForType('metric', metadata.metrics);

          this.set('metadataLoaded', true);
        }
      });
    }
    return Ember.RSVP.resolve();
  },

  /**
   * @method _loadMetadataForType
   * @private
   * Loads metadata based on type
   *
   * @param {String} type - type of metadata, table, dimension, or metric
   * @param {Array} metadataObjects - array of metadata objects
   */
  _loadMetadataForType(type, metadataObjects) {
    let metadata = metadataObjects.map((data) => {
      let payload = assign({}, data),
          owner = getOwner(this);
      setOwner(payload, owner);
      return owner.factoryFor(`model:metadata/${type}`).create(payload);
    });

    get(this, '_keg').pushMany(`metadata/${type}`, metadata);
  },

  /**
   * @method all
   * returns all metadata objects of type `type`
   *
   * @param {String} type
   * @returns {Promise} - array of all table metadata
   */
  all(type) {
    Ember.assert('Type must be table, metric or dimension', Ember.A(['table', 'dimension', 'metric']).includes(type));
    Ember.assert('Metadata must be loaded before the operation can be performed', get(this, 'metadataLoaded'));

    return get(this, '_keg').all(`metadata/${type}`);
  },

  /**
   * @method getById
   * Retrieves metadata based on type and id
   *
   * @param {String} type
   * @param {String} id
   * @returns {Object} metadata model object
   */
  getById(type, id) {
    Ember.assert('Type must be table, metric or dimension', Ember.A(['table', 'dimension', 'metric']).includes(type));
    Ember.assert('Metadata must be loaded before the operation can be performed', get(this, 'metadataLoaded'));

    return get(this, '_keg').getById(`metadata/${type}`, id);
  },

  /**
   * @method fetchById
   * Fetch metadata based on type and id
   *
   * @param {String} type
   * @param {String} id
   * @returns {Promise}
   */
  fetchById(type, id) {
    Ember.assert('Type must be table, metric or dimension', Ember.A(['table', 'dimension', 'metric']).includes(type));

    //Get entity if already present in the keg
    if(get(this, '_keg').getById(`metadata/${type}`, id)) {
      return this.getById(type, id);
    }

    return get(this, '_adapter').fetchMetadata(type, id).then(meta => {
      //load into keg if not already present
      this._loadMetadataForType(type, [ meta ]);
      return meta;
    });
  },

  /**
   * @method getMetadataById
   * @deprecated
   *
   */
  getMetadataById() {
    Ember.deprecate('Method getMetadataById has been replaced with getById method', false, {
      id: 'navi-data.getMetadataById',
      until: '4.0.0'
    });
    return this.getById(...arguments);
  },

  /**
   * Convenience method to get a meta data field
   * @param {String} type
   * @param {String} id
   * @param {String} field
   * @param {*} defaultIfNone - (optional) default if meta data or field isn't found
   * @returns {*}
   */
  getMetaField(type, id, field, defaultIfNone = null) {
    let meta = this.getById(type, id);
    if(!meta) {
      return defaultIfNone;
    }
    return getWithDefault(meta, field, defaultIfNone);
  }
});

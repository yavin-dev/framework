/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that helps retrieve metadata from WS
 */

import { deprecate } from '@ember/application/deprecations';
import { A } from '@ember/array';
import { assert } from '@ember/debug';
import Service, { inject as service } from '@ember/service';
import { assign } from '@ember/polyfills';
import { setOwner, getOwner } from '@ember/application';
import { getWithDefault } from '@ember/object';
import { resolve } from 'rsvp';
import { getDefaultDataSourceName } from '../utils/adapter';

export default class BardMetadataService extends Service {
  /**
   * @private
   * @property {Object} adapter - the adapter object
   */
  _adapter = undefined;

  /**
   * @private
   * @property {Object} serializer - the serializer object
   */
  _serializer = undefined;

  /**
   * @private
   * @property {Ember.Service} _keg - keg service
   */
  @service('keg') _keg;

  /**
   * @property {Array} loadedDataSources - list of data sources in which meta data has already been loaded
   */
  loadedDataSources = [];

  /**
   * @method init
   */
  constructor() {
    super(...arguments);

    //Instantiating the bard metadata adapter & serializer
    const owner = getOwner(this);
    this._adapter = owner.lookup('adapter:bard-metadata');
    this._serializer = owner.lookup('serializer:bard-metadata');
  }

  /**
   * @method loadMetadata
   * Fetches metadata from the bard WS using the metadata adapter and loads into keg
   *
   * @param {Object} options - options object used by the adapter
   * @returns {Promise} promise that loads metadata
   */
  loadMetadata(options = {}) {
    const dataSource = options.dataSourceName || getDefaultDataSourceName();
    //fetch metadata from WS if metadata not yet loaded
    if (!this.loadedDataSources.includes(dataSource)) {
      return this._adapter
        .fetchAll(
          'table',
          assign(
            {
              query: { format: 'fullview' }
            },
            options
          )
        )
        .then(payload => {
          //normalize payload
          payload.source = dataSource;
          let metadata = this._serializer.normalize(payload);

          if (!(this.isDestroyed || this.isDestroying)) {
            //create metadata model objects and load into keg
            this._loadMetadataForType('table', metadata.tables, dataSource);
            this._loadMetadataForType('dimension', metadata.dimensions, dataSource);
            this._loadMetadataForType('metric', metadata.metrics, dataSource);

            this.loadedDataSources.push(dataSource);
          }
        });
    }
    return resolve();
  }

  /**
   * @method _loadMetadataForType
   * @private
   * Loads metadata based on type
   *
   * @param {String} type - type of metadata, table, dimension, or metric
   * @param {Array} metadataObjects - array of metadata objects
   */
  _loadMetadataForType(type, metadataObjects, namespace) {
    const metadata = metadataObjects.map(data => {
      const payload = assign({}, data);
      const owner = getOwner(this);
      setOwner(payload, owner);
      return owner.factoryFor(`model:metadata/${type}`).create(payload);
    });

    return this._keg.pushMany(`metadata/${type}`, metadata, { namespace });
  }

  /**
   * @method all
   * returns all metadata objects of type `type`
   *
   * @param {String} type
   * @param {String} namespace - optional, filters the result by namespace
   * @returns {Promise} - array of all table metadata
   */
  all(type, namespace) {
    assert('Type must be table, metric or dimension', A(['table', 'dimension', 'metric']).includes(type));
    assert('Metadata must be loaded before the operation can be performed', this.loadedDataSources.length > 0);

    if (namespace) {
      assert('Metadata must have the requested namespace loaded', this.loadedDataSources.includes(namespace));
    }

    return this._keg.all(`metadata/${type}`, namespace);
  }

  /**
   * @method getById
   * Retrieves metadata based on type and id
   *
   * @param {String} type
   * @param {String} id
   * @param {String} namespace - optional
   * @returns {Object} metadata model object
   */
  getById(type, id, namespace) {
    assert('Type must be table, metric or dimension', A(['table', 'dimension', 'metric']).includes(type));
    let source = namespace || getDefaultDataSourceName();
    assert('Metadata must be loaded before the operation can be performed', this.loadedDataSources.includes(source));

    return this._keg.getById(`metadata/${type}`, id, source);
  }

  /**
   * @method fetchById
   * Fetch metadata based on type and id
   *
   * @param {String} type
   * @param {String} id
   * @param {String} namespace
   * @returns {Promise}
   */
  fetchById(type, id, namespace) {
    assert('Type must be table, metric or dimension', A(['table', 'dimension', 'metric']).includes(type));
    let dataSourceName = namespace || getDefaultDataSourceName();

    return this._adapter.fetchMetadata(type, id, { dataSourceName }).then(meta => {
      //load into keg if not already present
      return this._loadMetadataForType(type, [meta], dataSourceName)?.[0];
    });
  }

  /**
   * @method findById
   * gets Metadata or fetches it if necessary
   *
   * @param {String} type
   * @param {String} id
   * @param {String} namespace
   * @returns {Promise}
   */
  findById(type, id, namespace) {
    //Get entity if already present in the keg
    let dataSourceName = namespace || getDefaultDataSourceName();
    const kegRecord = this._keg.getById(`metadata/${type}`, id, dataSourceName);
    if (kegRecord && !kegRecord.partialData) {
      return resolve(this.getById(type, id, dataSourceName));
    }

    return this.fetchById(type, id, dataSourceName);
  }

  /**
   * @method getMetadataById
   * @deprecated
   *
   */
  getMetadataById() {
    deprecate('Method getMetadataById has been replaced with getById method', false, {
      id: 'navi-data.getMetadataById',
      until: '4.0.0'
    });
    return this.getById(...arguments);
  }

  /**
   * Convenience method to get a meta data field
   * @param {String} type
   * @param {String} id
   * @param {String} field
   * @param {*} defaultIfNone - (optional) default if meta data or field isn't found
   * @param {String} namespace
   * @returns {*}
   */
  getMetaField(type, id, field, defaultIfNone = null, namespace = null) {
    let dataSourceName = namespace || getDefaultDataSourceName();
    let meta = this.getById(type, id, dataSourceName);
    if (!meta) {
      return defaultIfNone;
    }
    return getWithDefault(meta, field, defaultIfNone);
  }

  /**
   * Convenience method to get namespace of a table
   * @param {String} table
   * @returns {string} - namespace
   */
  getTableNamespace(table) {
    const items = this._keg.getBy('metadata/table', recordTable => (recordTable.name = table));

    return items.length ? items[0].source : getDefaultDataSourceName();
  }
}

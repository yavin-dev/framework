/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import layout from '../templates/components/report-builder';

const { computed, get } = Ember;

export default Ember.Component.extend({
  layout,

  classNames: ['report-builder'],

  /**
   * @property {Service} metadataService
   */
  metadataService: Ember.inject.service('bard-metadata'),

  /**
   * @property {Object} request
   */
  request: computed.readOnly('report.request'),

  /**
   * @property {Array} allTables - All metadata table records
   */
  allTables: computed(function() {
    let metadataService = get(this, 'metadataService');
    return metadataService.all('table');
  })
});

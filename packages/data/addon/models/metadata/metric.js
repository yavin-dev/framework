/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import ExtendedMetadataMixin from 'navi-data/mixins/extended-metadata';

let Model = Ember.Object.extend(ExtendedMetadataMixin, {
  /**
   * @property {String} type
   */
  type: 'metric',

  /**
   * @property {String} name
   */
  name: undefined,

  /**
   * @property {String} longName
   */
  longName: undefined,

  /**
   * @property {String} category
   */
  category: undefined,

  /**
   * @property {String} type of the value
   */
  valueType: undefined
});

//factory level properties
export default Model.reopenClass({
  /**
   * @property {String} identifierField - used by the keg as identifierField
   */
  identifierField: 'name'
});

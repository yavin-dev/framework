/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';

console.log('Reached QueryStat Model')
export default DS.Model.extend({
  requestID: DS.attr('string'),
  apiVersion: DS.attr('string'),
  apiQuery: DS.attr('string'),
  storeQuery: DS.attr('string'),
  nameModel: DS.attr('string'),
  user: DS.attr('string'), //maybe an inverse to user
  fromUI: DS.attr('boolean'),
  status: DS.attr('string'),
  duration: DS.attr('number'),
  rowsReturned: DS.attr('number'),
  bytesReturned: DS.attr('number'),
  createdOn: DS.attr('string'),
  hostName: DS.attr('string')
});

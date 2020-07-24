import DS from 'ember-data';

export default DS.Model.extend({
  requestID: DS.attr('string'),
  apiVersion: DS.attr('string'),
  apiQuery: DS.attr('string'),
  storeQuery: DS.attr('string'),
  modelName: DS.attr('string'),
  user: DS.attr('string'),
  fromUI: DS.attr('boolean'),
  status: DS.attr('string'),
  duration: DS.attr('number'),
  rowsReturned: DS.attr('number'),
  bytesReturned: DS.attr('number'),
  createdOn: DS.attr('date'),
  hostName: DS.attr('string')
});

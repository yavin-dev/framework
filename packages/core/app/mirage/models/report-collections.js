import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  reports: hasMany('report'),
  author: belongsTo('user')
});

import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  reports: hasMany('report', { inverse: null }),
  author: belongsTo('user', { inverse: null })
});

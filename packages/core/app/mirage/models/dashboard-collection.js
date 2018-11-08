import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  author: belongsTo('user', { inverse: null }),
  dashboards: hasMany('dashboard', { inverse: null })
});

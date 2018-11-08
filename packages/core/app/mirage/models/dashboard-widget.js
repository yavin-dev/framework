import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  author: belongsTo('user', { inverse: null }),
  dashboard: belongsTo('dashboard', { inverse: 'widgets' })
});

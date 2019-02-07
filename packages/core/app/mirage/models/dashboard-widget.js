import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  dashboard: belongsTo('dashboard', { inverse: 'widgets' })
});

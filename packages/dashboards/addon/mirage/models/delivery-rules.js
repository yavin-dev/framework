import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  deliveredItem: belongsTo('dashboard'),
  owner: belongsTo('user')
});

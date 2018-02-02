import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  deliveredItem: belongsTo('report'),
  owner: belongsTo('user')
});

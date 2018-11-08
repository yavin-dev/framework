import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  deliveredItem: belongsTo({ polymorphic: true }),
  owner: belongsTo('user', { inverse: 'deliveryRules' })
});

import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  author: belongsTo('user', { inverse: 'reports' }),
  deliveryRules: hasMany('delivery-rule', { inverse: 'deliveredItem' })
});

import Model from 'navi-core/mirage/fixtures/delivery-rules';
import { belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  deliveredItem: belongsTo('dashboard'),
  owner: belongsTo('user')
});
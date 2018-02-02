import Ember from 'ember';
import { JSONAPISerializer } from 'ember-cli-mirage';

const { String: { camelize } } = Ember;

export default JSONAPISerializer.extend({
  keyForAttribute: attr => camelize(attr),
  keyForModel: attr => camelize(attr),
  keyForRelationship: attr => camelize(attr)
});

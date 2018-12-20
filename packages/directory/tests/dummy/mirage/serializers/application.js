import { JSONAPISerializer } from 'ember-cli-mirage';
import { camelize } from '@ember/string';

export default JSONAPISerializer.extend({
  keyForAttribute: attr => camelize(attr),
  keyForModel: attr => camelize(attr),
  keyForRelationship: attr => camelize(attr)
});

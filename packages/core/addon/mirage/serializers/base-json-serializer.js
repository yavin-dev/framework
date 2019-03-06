import { JSONAPISerializer } from 'ember-cli-mirage';
import { camelize } from '@ember/string';

export default JSONAPISerializer.extend({
  alwaysIncludeLinkageData: true,

  keyForAttribute: attr => attr,

  keyForModel: attr => camelize(attr),

  keyForRelationship: attr => camelize(attr),

  serializeIds: 'always'
});

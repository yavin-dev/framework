import { JSONAPISerializer } from 'ember-cli-mirage';
import { camelize } from '@ember/string';

export default JSONAPISerializer.extend({
  alwaysIncludeLinkageData: true,

  keyForAttribute: attr => camelize(attr),

  keyForModel: attr => camelize(attr),

  keyForRelationship: attr => camelize(attr),

  serializeIds: 'always',

  serialize(response, request) {
    let json = JSONAPISerializer.prototype.serialize.apply(this, arguments);

    console.log('response: ', response);
    console.log('request: ', request);
    // debugger;
    return json;
  }
});

import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import { camelize } from '@ember/string';

export default class extends JSONAPISerializer {
  alwaysIncludeLinkageData = true;

  keyForAttribute = (attr) => attr;

  keyForModel = (attr) => camelize(attr);

  keyForRelationship = (attr) => camelize(attr);

  serializeIds: 'always';

  getCoalescedIds(request) {
    const { filter } = request.queryParams ?? {};
    if (typeof filter === 'string') {
      const idStr = filter.split('=in=')[1].replace('(', '').replace(')', '');
      return idStr.split(',');
    }
    return [];
  }
}

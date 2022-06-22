/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard response
 */

import ElideFactsSerializer from '@yavin/client/plugins/elide/serializers/facts';
import { getOwner } from '@ember/application';

export default class NaviFiliFactsSerializer extends ElideFactsSerializer {
  static create(args: unknown) {
    const owner = getOwner(args);
    const yavinClient = owner.lookup('service:yavin-client');
    return new this(yavinClient.injector);
  }
}

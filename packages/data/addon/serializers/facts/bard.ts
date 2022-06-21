/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard response
 */

import FiliFactsSerializer from '@yavin/client/plugins/fili/serializers/facts';
import { getOwner } from '@ember/application';

export default class NaviFiliFactsSerializer extends FiliFactsSerializer {
  static create(args: unknown) {
    const owner = getOwner(args);
    const yavinClient = owner.lookup('service:yavin-client');
    return new this(yavinClient.injector);
  }
}

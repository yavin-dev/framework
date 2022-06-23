/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import FiliMetadataSerializer from '@yavin/client/plugins/fili/serializers/metadata';
import { getOwner } from '@ember/application';

export default class NaviFiliMetadataSerializer extends FiliMetadataSerializer {
  static create(args: unknown) {
    const owner = getOwner(args);
    const yavinClient = owner.lookup('service:yavin-client');
    return new this(yavinClient.injector);
  }
}

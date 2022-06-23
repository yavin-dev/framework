/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import ElideMetadataSerializer from '@yavin/client/plugins/elide/serializers/metadata';
import { getOwner } from '@ember/application';

export default class NaviElideMetadataSerializer extends ElideMetadataSerializer {
  static create(args: unknown) {
    const owner = getOwner(args);
    const yavinClient = owner.lookup('service:yavin-client');
    return new this(yavinClient.injector);
  }
}

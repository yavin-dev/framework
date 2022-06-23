/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { getOwner } from '@ember/application';
import ElideMetadataAdapter from '@yavin/client/plugins/elide/adapters/metadata';

export default class NaviElideMetadataAdapter extends ElideMetadataAdapter {
  static create(args: unknown) {
    const owner = getOwner(args);
    const yavinClient = owner.lookup('service:yavin-client');
    return new this(yavinClient.injector);
  }
}

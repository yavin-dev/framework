/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The fact adapter for the bard request v2 model.
 */
import ElideFactsAdapter from '@yavin/client/plugins/elide/adapters/facts';
import { getOwner } from '@ember/application';

export default class NaviElideFactsAdapter extends ElideFactsAdapter {
  static create(args: unknown) {
    const owner = getOwner(args);
    const yavinClient = owner.lookup('service:yavin-client');
    return new this(yavinClient.injector);
  }
}

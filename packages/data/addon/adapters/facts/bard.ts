/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The fact adapter for the bard request v2 model.
 */
import FiliFactsAdapter from '@yavin/client/plugins/fili/adapters/facts';
import { getOwner } from '@ember/application';

export default class NaviFiliFactsAdapter extends FiliFactsAdapter {
  static create(args: unknown) {
    const owner = getOwner(args);
    const yavinClient = owner.lookup('service:yavin-client');
    return new this(yavinClient.injector);
  }
}

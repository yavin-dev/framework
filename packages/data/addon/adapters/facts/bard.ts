/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The fact adapter for the bard request v2 model.
 */
import FiliFactsAdapter from '@yavin/client/plugins/fili/adapter/facts';
import { getOwner } from '@ember/application';

export default class NaviFiliFactsAdapter extends FiliFactsAdapter {
  static create(owner: any) {
    owner = getOwner(owner);
    return new NaviFiliFactsAdapter(owner.lookup('service:client-injector'));
  }
}

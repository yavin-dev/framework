/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The fact adapter for the bard request v2 model.
 */
import BardFactsAdapter from '@yavin/client/plugins/bard/adapter/facts';
import { getOwner } from '@ember/application';

export default class NaviBardFactsAdapter extends BardFactsAdapter {
  static create(owner: any) {
    owner = getOwner(owner);
    return new NaviBardFactsAdapter(owner.lookup('service:client-injector'));
  }
}

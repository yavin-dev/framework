/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';

export default class GetWidgetHelper extends Helper {
  @service declare store: Store;

  compute([id]: [string]) {
    return this.store.peekRecord('dashboard-widget', id);
  }
}

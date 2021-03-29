/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base search provider service.
 */

import Service from '@ember/service';
import { assert } from '@ember/debug';
import type { TaskGenerator } from 'ember-concurrency';

export default class NaviBaseSearchProviderService extends Service {
  resultThreshold = 10;

  search(_query: string): TaskGenerator<TODO> {
    assert('Search method must be called from a subclass');
  }
}

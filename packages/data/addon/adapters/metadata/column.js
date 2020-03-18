/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the bard-facts model.
 */
import EmberObject from '@ember/object';

export default class ColumnAdapter extends EmberObject {
  buildURLId(id) {
    return id.split('.').pop();
  }
}

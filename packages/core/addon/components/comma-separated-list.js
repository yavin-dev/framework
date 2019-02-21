/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Takes a list of strings and formats them to be used within an english sentence.
 * The strings will be joined with a "," with "and" before the last item.
 *
 * Usage:
 *   {{~#comma-separated-list list=list as |item| ~}}
 *      <span class='custom-element'>{{item}}</span>
 *   {{~/comma-separated-list~}}
 */
import Component from '@ember/component';

import { get, computed } from '@ember/object';
import layout from '../templates/components/comma-separated-list';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName
   * @override
   */
  tagName: '',

  /**
   * @property {Array} commaItems - the subset of items that need a comma added after them
   * @private
   */
  _commaItems: computed('list.[]', function() {
    return get(this, 'list').slice(0, -1);
  })
});

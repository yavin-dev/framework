/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-table-sort-icon
 *   direction=sortDirection
 * }}
 */

import Ember from 'ember';
import layout from '../templates/components/navi-table-sort-icon';

const { computed, get } = Ember;

const SORT_ICONS = {
  asc: 'navi-table-sort-icon--asc',
  desc: 'navi-table-sort-icon--desc',
  none: 'navi-table-sort-icon--none'
};

export default Ember.Component.extend({
  layout,

  /**
   * @property tagName
   */
  tagName: 'span',

  /**
   * @property {Array} classNames
   */
  classNames: ['navi-table-sort-icon'],

  /**
   * @property {Array} classNameBindings
   */
  classNameBindings: ['sortClass'],

  /**
   * @property {String} sortClass
   */
  sortClass: computed('direction', function() {
    return SORT_ICONS[get(this, 'direction')];
  })
});

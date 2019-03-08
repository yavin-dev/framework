/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{favorite-item
 *      user=userModel
 *      item=item
 *      itemType='type'
 *   }}
 */
import { A } from '@ember/array';

import { capitalize } from '@ember/string';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import Ember from 'ember';
import layout from '../templates/components/favorite-item';

export default Component.extend({
  layout,

  classNames: ['favorite-item', 'clickable'],

  classNameBindings: ['isFavorite:favorite-item--active'],

  /**
   * @property {String} itemType
   */
  itemType: computed('item', function() {
    return get(this, 'item.constructor.modelName');
  }),

  /**
   * @property {Array} favoriteItems - array of the favorite items retrieved from the user
   */
  favoriteItems: computed('itemType', function() {
    let itemType = get(this, 'itemType'),
      pluralizedType = capitalize(Ember.Inflector.inflector.pluralize(itemType));

    return get(this, `user.favorite${pluralizedType}`);
  }),

  /**
   * @property {Boolean} isFavorite - whether or not the given user favorites the given item
   */
  isFavorite: computed('favoriteItems.[]', 'item', function() {
    let items = A(get(this, 'favoriteItems'));
    return items.includes(get(this, 'item'));
  })
});

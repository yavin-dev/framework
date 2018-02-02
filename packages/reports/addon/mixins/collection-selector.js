/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

const { get, assert } = Ember;

export default Ember.Mixin.create({
  /**
   *  @property {String} tagName
   */
  tagName: 'fieldset',

  /**
   * @property {Array} items - An array of data objects
   */
  items: undefined,

  /**
   * @property {Object} [selectedItem] - Selected collection value
   */
  selectedItem: undefined,

  /**
   * @observer validate
   * Validates selectedItem and item on init
   */
  validate: Ember.on('init', Ember.observer('selectedItem', 'items.[]', function() {
    let selectedItem = get(this, 'selectedItem.0') || get(this, 'selectedItem'),
        items = get(this, 'items');

        // Checks if items array is defined and not empty
    assert('Items array should not be empty', !Ember.isEmpty(items));

    // Check if items array is unique
    assert('Items array should be unique', get(Ember.A(items).uniq(), 'length') === get(items, 'length'));

    //Check if selectedItem is present in items array
    if (selectedItem && !Ember.A(items).includes(selectedItem)) {
      assert(`Selected item ${selectedItem} is not present in items array`, Ember.A(items).includes(selectedItem));
    }
  }))
});

/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * An extended pick-container used for selecting complex objects.
 * Changes can be staged to a single property of the selection,
 * rather than replacing the whole object.
 *
 * Usage:
 *   {{#pick-object-container selection=selectedValue as |selection container|}}
 *      {{#pick-value}}
 *      {{/pick-value}}
 *      {{#pick-form}}
 *          <div {{action 'stagePropertyChange' 'myProperty' 'myNewValue' target=container}}></div>
 *          <div {{action 'stagePropertyChange' 'myOtherProperty' 'newValue' target=container}}></div>
 *      {{/pick-form}}
 *   {{/pick-object-container}}
 */
import Ember from 'ember';
import PickContainer from './pick-container';

export default PickContainer.extend({
  actions: {
    /**
     * @action stagePropertyChange
     * @param {String} key - name of property to set
     * @param {Object} value - new value for property to be
     */
    stagePropertyChange(key, value) {
      let selection = this.getStagedSelection() || {};

      Ember.set(selection, key, value);

      this.send('stageChanges', selection);
    }
  }
});

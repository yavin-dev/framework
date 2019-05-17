/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{pick-single
 *  selection=selection
 *  options=options
 *  onUpdateSelection=(action 'updateSelection')
 *  [idField] #needed if different from `id`
 *  [displayField] #needed if different from `id`
 *  [label] #optional
 * }}
 */

import Component from '@ember/component';
import layout from '../templates/components/pick-single';
import { get } from '@ember/object';

export default Component.extend({
  layout: layout,

  /**
   * @property idField - default field to use for id
   */
  idField: 'id',

  /**
   * @property descriptionField - default field to use to display
   */
  displayField: 'id',

  actions: {
    /**
     * @action updateSelection - bubbles up the action
     * @param selection
     */
    updateSelection(selection) {
      const handler = get(this, 'onUpdateSelection');

      if (handler) handler(selection);
    }
  }
});

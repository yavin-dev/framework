/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#report-actions/save-as
 *      model=model
 *   }}
 *      Inner template
 *   {{/report-actions/save-as}}
 */

import Component from '@ember/component';
import layout from '../../templates/components/report-actions/save-as';
import { get, set, computed } from '@ember/object';

export default Component.extend({
  layout,

  /**
   * @property {Boolean} showModal - flag to control modal display
   */
  showModal: false,

  /**
   * @property {String} reportName - report name/title
   */
  reportName: computed('model', function() {
    return `(New Copy) ${get(this, 'model.title')}`.substring(0, 150);
  }),

  actions: {
    /**
     * @action closeModal or cancel modal.
     */
    closeModal() {
      // Avoid `calling set on destroyed object` error
      if (!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
        set(this, 'showModal', false);
      }
    }
  }
});

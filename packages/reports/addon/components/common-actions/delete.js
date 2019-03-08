/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#common-actions/delete
 *      model=model
 *      warnMsg=warnMsg
 *      deleteAction=deleteAction
 *      disabled=disabled
 *   }}
 *      Inner template
 *   {{/common-actions/delete}}
 */
import Component from '@ember/component';

import { dasherize } from '@ember/string';
import { computed, set, get } from '@ember/object';
import layout from '../../templates/components/common-actions/delete';

const dasherizeName = dasherize;

export default Component.extend({
  layout,

  /**
   * @property {Boolean} showModal - flag to control modal display
   */
  showModal: false,

  /**
   * @property {Boolean} isDeleting - Boolean to indicate if delete is in progress
   */
  isDeleting: false,

  /**
   * @property {String} modelName - display name of the model to be deleted
   */
  modelName: computed('model', function() {
    let model = get(this, 'model');
    return model.constructor.modelName;
  }),

  /**
   * @property {String} headerMsg - message in the header of what's being deleted
   */
  headerMsg: computed('model.title', function() {
    return `Delete "${get(this, 'model.title')}"`;
  }),

  /**
   * @property {String} warnMsg - Warning message before deleting
   */
  warnMsg: computed('modelName', function() {
    return `Are you sure you want to delete this ${dasherizeName(get(this, 'modelName'))}?`;
  }),

  actions: {
    /**
     * @action closeModal
     */
    closeModal() {
      // Avoid `calling set on destroyed object` error
      if (!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
        set(this, 'showModal', false);
      }
    }
  }
});

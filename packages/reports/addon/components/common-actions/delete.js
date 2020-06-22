/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <CommonActions::Delete
 *      @model={{this.model}}
 *      @warnMsg={{this.warnMsg}}
 *      @deleteAction={{this.deleteAction}}
 *      @disabled={{this.disabled}}
 *   >
 *      Inner template
 *   </CommonActions::Delete>
 */
import Component from '@ember/component';
import { dasherize } from '@ember/string';
import { computed, set, action } from '@ember/object';
import layout from '../../templates/components/common-actions/delete';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class DeleteActionComponent extends Component {
  /**
   * @property {Boolean} showModal - flag to control modal display
   */
  showModal = false;

  /**
   * @property {Boolean} isDeleting - Boolean to indicate if delete is in progress
   */
  isDeleting = false;

  /**
   * @property {String} modelName - display name of the model to be deleted
   */
  @computed('model')
  get modelName() {
    const { model } = this;
    return model.constructor.modelName;
  }

  /**
   * @property {String} headerMsg - message in the header of what's being deleted
   */
  @computed('model.title')
  get headerMsg() {
    return `Delete "${this.model.title}"`;
  }

  /**
   * @property {String} warnMsg - Warning message before deleting
   */
  @computed('modelName')
  get warnMsg() {
    return `Are you sure you want to delete this ${dasherize(this.modelName)}?`;
  }

  /**
   * @action closeModal
   */
  @action
  closeModal() {
    // Avoid `calling set on destroyed object` error
    if (!this.isDestroyed && !this.isDestroying) {
      set(this, 'showModal', false);
    }
  }
}

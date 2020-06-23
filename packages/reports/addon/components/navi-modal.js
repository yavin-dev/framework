/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Modal Component
 *
 * Usage:
 * <NaviModal
 *     @isShown={{this.isShown}}
 *     as |modalContainer|>
 *         Inner Template
 * </NaviModal>
 */

import Component from '@ember/component';
import layout from '../templates/components/navi-modal';
import { action, set } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@tagName('')
@templateLayout(layout)
export default class NaviModal extends Component {
  /**
   * @property {Boolean} isShown - if Modal should be shown
   */
  isShown = false;

  /**
   * Set the isShown to false in order to close the modal.
   */
  @action
  closeModal() {
    set(this, 'isShown', false);
    const { onClose } = this;

    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  }
}

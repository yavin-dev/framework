/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <CommonActions::Share
 *     @pageTitle={{this.nameOfPageToShare}}
 *     @buildUrl={{this.optionalCodeForGeneratingUrlToShare}}
 *   >
 */
import Component from '@ember/component';
import { action, set, computed } from '@ember/object';
import layout from '../../templates/components/common-actions/share';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class ShareActionComponent extends Component {
  /**
   * @property {String} pageTitle - name of page being shared
   */
  pageTitle = undefined;

  /**
   * @property {String} currentUrl
   */
  @computed('showModal')
  get currentUrl() {
    // Allow custom url logic for sharing something other than current page
    const { buildUrl } = this;
    if (buildUrl) {
      return buildUrl();
    }

    return document.location.href;
  }

  /**
   * Sets the notifications to false, used when modal is closed to clean it up.
   */
  @action
  resetNotifications() {
    set(this, 'successNotification', false);
    set(this, 'errorNotification', false);
  }
}

export default ShareActionComponent;

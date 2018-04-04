/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#common-actions/share
 *      pageTitle=nameOfPageToShare
 *      buildUrl=(action 'optionalCodeForGeneratingUrlToShare')
 *   }}
 */
import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import layout from '../../templates/components/common-actions/share';

export default Component.extend({
  layout,

  /**
   * @property {String} pageTitle - name of page being shared
   */
  pageTitle: undefined,

  /**
   * @property {String} currentUrl
   */
  currentUrl: computed('showModal', function() {
    // Allow custom url logic for sharing something other than current page
    let buildUrl = get(this, 'buildUrl');
    if (buildUrl) {
      return buildUrl();
    }

    return document.location.href;
  }),

  actions: {
    /**
     * Sets the notifications to false, used when modal is closed to clean it up.
     */
    resetNotifications() {
      set(this, 'successNotification', false);
      set(this, 'errorNotification', false);
    }
  }
});

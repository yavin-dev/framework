/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{navi-email-input
 *       emails=emails
 *       addEmail=(action 'addEmail')
 *       removeEmailAtIndex=(action 'removeEmailAtIndex')
 *   }}
 */
import { get } from '@ember/object';

import Component from '@ember/component';
import layout from '../templates/components/navi-email-input';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['navi-email-input'],

  /**
   * @property {Array} emails
   */
  emails: [],

  actions: {
    /**
     * @action addEmail
     * @param {String} email
     */
    addEmail(email) {
      let emails = get(this, 'emails');

      this.onUpdateEmails([...emails, email]);
    },

    /**
     * @action removeEmailAtIndex
     * @param {Number} index
     */
    removeEmailAtIndex(index) {
      let emails = get(this, 'emails');

      this.onUpdateEmails(emails.filter((email, i) => i != index));
    }
  }
});

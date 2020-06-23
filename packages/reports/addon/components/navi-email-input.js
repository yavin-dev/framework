/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviEmailInput
 *      @emails={{this.emails}}
 *      @addEmail={{this.addEmail}}
 *      @removeEmailAtIndex={{this.removeEmailAtIndex}}
 *      @isDisabled={{false}}
 *   />
 */
import { action } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/navi-email-input';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@tagName('')
@templateLayout(layout)
export default class NaviEmailInput extends Component {
  /**
   * @property {Array} emails
   */
  emails = [];

  /**
   * @action addEmail
   * @param {String} email
   */
  @action
  addEmail(email) {
    const { emails } = this;
    this.onUpdateEmails([...emails, email]);
  }

  /**
   * @action removeEmailAtIndex
   * @param {Number} index
   */
  @action
  removeEmailAtIndex(index) {
    const { emails } = this;
    this.onUpdateEmails(emails.filter((email, i) => i != index));
  }
}

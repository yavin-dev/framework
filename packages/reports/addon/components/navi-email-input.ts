/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviEmailInput
 *      @emails={{this.emails}}
 *      @onUpdateEmails={{this.onUpdateEmails}}
 *      @isDisabled={{false}}
 *   />
 */
import { action } from '@ember/object';
import Component from '@glimmer/component';

interface Args {
  emails: string[];
  isDisabled: boolean;
  onUpdateEmails(emails: string[]): void;
}

export default class NaviEmailInput extends Component<Args> {
  /**
   * @action addEmail
   * @param {String} email
   */
  @action
  addEmail(email: string) {
    const { emails = [] } = this.args;
    this.args.onUpdateEmails([...emails, email]);
  }

  /**
   * @action removeEmailAtIndex
   * @param {Number} index
   */
  @action
  removeEmailAtIndex(index: number) {
    const { emails = [] } = this.args;
    this.args.onUpdateEmails(emails.filter((_email, i) => i != index));
  }
}

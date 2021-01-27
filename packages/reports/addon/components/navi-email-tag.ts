/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviTagInputTag from './navi-tag-input/tag';
import { computed } from '@ember/object';
//@ts-ignore
import validateFormat from 'ember-validators/format';

export default class NaviEmailTag extends NaviTagInputTag {
  @computed('isValidEmail')
  get state() {
    return !this.isValidEmail ? 'disabled' : undefined;
  }

  /**
   * @property {boolean} isValidEmail
   */
  @computed('args.tag')
  get isValidEmail() {
    // Validation function returns true if valid, or an object if false, so normalize it into a boolean
    return true === validateFormat(this.args.tag, { type: 'email' });
  }
}

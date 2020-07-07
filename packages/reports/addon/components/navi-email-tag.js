/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviEmailTag
 *     @tag={{this.tag}}
 *     @index={{this.index}}
 *     @isRemovable={{true}}
 *     @onRemoveTag={{this.removeTag}}
 *   />
 */
import NaviTagInputTag from './navi-tag-input/tag';
import layout from '../templates/components/navi-tag-input/tag';
import { computed } from '@ember/object';
import validateFormat from 'ember-validators/format';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class NaviEmailTag extends NaviTagInputTag {
  /**
   * @property {string} extraClassNames - top level classNames for the input
   */
  @computed('isValidEmail')
  get extraClassNames() {
    const className = 'navi-email-tag';
    return this.isValidEmail ? className : `${className} ${className}--is-disabled`;
  }

  /**
   * @property {boolean} isValidEmail
   */
  @computed('tag')
  get isValidEmail() {
    const { tag } = this;

    // Validation function returns true if valid, or an object if false, so normalize it into a boolean
    return validateFormat(tag, { type: 'email' }) === true;
  }
}

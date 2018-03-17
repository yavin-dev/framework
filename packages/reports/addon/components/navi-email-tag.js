/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{navi-email-tag
 *       tag=tag
 *       index=index
 *       isRemovable=true
 *       onRemoveTag=(action 'removeTag')
 *   }}
 */
import Component from '@ember/component';
import layout from '../templates/components/navi-tag-input/tag';
import { computed, get } from '@ember/object';
import validateFormat from 'ember-validators/format';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['navi-email-tag'],

  /**
   * @property {Array} classNameBindings
   */
  classNameBindings: ['isValidEmail::navi-email-tag--is-disabled'],

  /**
   * @property {Boolean} isValidEmail
   */
  isValidEmail: computed('tag', function() {
    let tag = get(this, 'tag');

    // Validation function returns true if valid, or an object if false, so normalize it into a boolean
    return validateFormat(tag, { type: 'email' }) === true;
  })
});

/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{dir-icon iconClass}}
 */

import Component from '@ember/component';
import layout from '../templates/components/dir-icon';

export default Component.extend({
  layout,

  classNames: ['dir-icon'],

  tagName: 'span'
}).reopenClass({
  positionalParams: ['iconClass']
});

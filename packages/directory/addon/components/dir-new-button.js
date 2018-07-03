/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{dir-new-button}}
 */

import Component from '@ember/component';
import layout from '../templates/components/dir-new-button';
import { set } from '@ember/object';

export default Component.extend({
  layout,

  classNames: [ 'dir-new-button' ],

  /**
   * @method calculatePosition
   * @returns {Object} - positioning info used by ember-basic-dropdown
   */
  calculatePosition(trigger, content) {
    let { top, left, width, height } = trigger.getBoundingClientRect(),
        { width: contentWidth } = content.getBoundingClientRect(),
        marginFromTopBar = 15,
        style = {
          left: left - contentWidth + width,
          top: top + height + marginFromTopBar
        };

    return { style };
  },

  /**
   * @override
   * @method init
   */
  init() {
    this._super(...arguments);

    set(this, 'documentTypes', [
      {name: 'reports', iconClass: 'file-text', linkRoute: 'reports.new'},
      {name: 'dashboards', iconClass: 'th-large', linkRoute: 'dashboards.new'}
    ]);
  }
});

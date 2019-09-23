/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviButton
 *     @type="seconary"
 *     @disabled={{false}}
 *     @onClick={{action onClick}}
 *   >
 *     Inner HTML
 *   </NaviButton>
 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/navi-button';

export default Component.extend({
  layout,
  tagName: '',
  class: computed('disabled', 'type', function() {
    const type = this.type || 'primary';
    const isDisabled = this.disabled;
    const diabledModifier = isDisabled ? '-disabled' : '';
    const modifier = `navi-button--${type}${diabledModifier}`;
    return `navi-button ${modifier}`;
  })
});

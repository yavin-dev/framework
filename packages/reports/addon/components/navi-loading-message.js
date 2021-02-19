/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#navi-loading-message}}
 *       Message
 *   {{/navi-loading-message}}}}
 */
import Component from '@ember/component';
import layout from '../templates/components/navi-loading-message';

export default Component.extend({
  layout,

  classNames: ['navi-loading-message'],
});

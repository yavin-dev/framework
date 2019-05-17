/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#loading-message}}
 *       Message
 *   {{/loading-message}}}}
 */
import Component from '@ember/component';
import layout from '../templates/components/loading-message';

export default Component.extend({
  layout,

  classNames: ['loading-message']
});

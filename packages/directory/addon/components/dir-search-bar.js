/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{dir-search-bar
 *   query=query
 *   searchFor=(action 'searchFor' query)
 * }}
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-search-bar';

export default Component.extend({
  layout,

  classNames: ['dir-search-bar']
});

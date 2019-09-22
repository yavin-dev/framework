/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Picks the correct cell renderer to use. Allows for extension in apps.
 *
 * Usage:
 * {{navi-table-cell-renderer
 *     column=column
 *     data=data
 *     request=request
 * }}
 */
import Component from '@ember/component';
import layout from '../templates/components/navi-table-cell-renderer';
import { computed } from '@ember/object';
import { dasherize } from '@ember/string';

export default Component.extend({
  layout,

  tagName: '',

  prefix: 'navi-cell-renderers/',

  /**
   * Chooses which cell renderer to use based on type of column
   */
  cellRenderer: computed('column.type', function() {
    return this.get('prefix') + dasherize(this.get('column.type'));
  })
});

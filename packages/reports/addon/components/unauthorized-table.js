/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{unauthorized-table report=reportModel}}
 */

import Component from '@ember/component';

import { set, get } from '@ember/object';
import layout from '../templates/components/unauthorized-table';

export default Component.extend({
  layout,

  /**
   * Don't wrap the component
   */
  tagName: '',

  /**
   * Compute the table name first entry only.
   *
   * @property {String} tableName - name of the logical table
   */
  tableName: '',

  init() {
    this._super(...arguments);
    set(this, 'tableName', get(this, 'report.request.logicalTable.table.longName'));
  }
});

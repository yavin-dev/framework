/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#grouped-list
 *      items=items
 *      shouldOpenAllGroups=false
 *      groupByField=field
 *      sortByField=field
 *      as | item |
 *   }}
 *       {{item.val}}
 *   {{/grouped-list}}
 */
import Component from '@ember/component';

import { get, computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import layout from '../templates/components/grouped-list';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';

export default Component.extend({
  layout,

  classNames: ['grouped-list'],

  /*
   * @property {Object} groupedItems - object with keys as group names and the values as items in the group
   */
  groupedItems: computed('items', 'groupByField', 'sortByField', function() {
    let items = get(this, 'items'),
      groupByField = get(this, 'groupByField'),
      sortByField = get(this, 'sortByField');

    let grouped = groupBy(items, row => row[groupByField].split(',')[0]);

    if (!isBlank(sortByField)) {
      Object.entries(grouped).forEach(([key, value]) => {
        grouped[key] = sortBy(value, [sortByField]);
      });
    }

    return grouped;
  })
});

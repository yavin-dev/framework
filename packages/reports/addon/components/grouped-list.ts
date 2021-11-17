/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { groupBy, sortBy } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

interface Args {
  items: Array<Record<string, string>>;
  shouldOpenAllGroups: boolean;
  containerSelector: string;
  groupByField: string;
  sortByField?: string | null;
  isSingleCategory?: boolean;
}

export default class GroupedListComponent extends Component<Args> {
  @tracked
  groupConfigs: Record<string, boolean> = {};

  guid = guidFor(this);

  get groupedItems() {
    const { items, groupByField } = this.args;
    const sortByField = this.args.sortByField || '';

    const grouped = groupBy(items, (row) => row[groupByField]?.split(',')[0] || `Uncategorized`);

    if (sortByField.trim() !== '') {
      Object.entries(grouped).forEach(([key, value]) => {
        grouped[key] = sortBy(value, [sortByField]);
      });
    }
    return grouped;
  }

  /**
   * List of all groups and the items of opened groups
   */
  get flatItems() {
    const {
      groupedItems,
      args: { shouldOpenAllGroups },
      groupConfigs,
    } = this;

    const items: Array<
      { name: string; length: number; isOpen: boolean; isGroup: boolean } | Record<string, string>
    > = [];

    // make categories into sorted array
    let sortedCategories = Object.entries(groupedItems).sort(function (a, b) {
      if (a[0] === `Uncategorized`) {
        return 1;
      } else if (b[0] === `Uncategorized`) {
        return -1;
      } else {
        return a[0].localeCompare(b[0]);
      }
    });

    // flatten category headers and items into single list
    sortedCategories.forEach(([name, groupItems]) => {
      const isOpen = groupConfigs[name] || shouldOpenAllGroups;
      if (!this.args.isSingleCategory) {
        items.push({ name, length: groupItems.length, isOpen, isGroup: true });
      }
      if (isOpen || this.args.isSingleCategory) {
        items.push(...groupItems);
      }
    });
    return items;
  }

  /**
   * Toggles the open state for a given group
   */
  @action
  toggleOpen(group: string) {
    this.groupConfigs[group] = !this.groupConfigs[group];
    this.groupConfigs = { ...this.groupConfigs };
  }
}

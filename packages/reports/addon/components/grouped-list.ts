/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { groupBy, sortBy } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

interface Args {
  items: Array<Record<string, string>>;
  shouldOpenAllGroups: boolean;
  containerSelector: string;
  groupByField: string;
  sortByField: string;
}

export default class GroupedListComponent extends Component<Args> {
  @tracked
  groupConfigs: Record<string, boolean> = {};

  guid = guidFor(this);

  get groupedItems() {
    const { items, groupByField, sortByField } = this.args;

    const grouped = groupBy(items, (row) => row[groupByField]?.split(',')[0] || `Uncategorized`);

    if (!isBlank(sortByField)) {
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
    return Object.keys(groupedItems).reduce((items, name) => {
      const groupItems = groupedItems[name];
      const isOpen = groupConfigs[name] || false || shouldOpenAllGroups;

      items.push({ name, length: groupItems.length, isOpen, isGroup: true });
      if (isOpen) {
        items.push(...groupItems);
      }
      return items;
    }, items);
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

/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <GroupedList
 *      @items={{this.items}}
 *      @shouldOpenAllGroups={{false}}
 *      @groupByField={{this.field}}
 *      @sortByField={{this.field}}
 *      as | item |
 *   >
 *       {{item.val}}
 *   </GroupedList>
 */
import Component from '@ember/component';
import { getWithDefault, set, computed, action } from '@ember/object';
import { isBlank } from '@ember/utils';
import layout from '../templates/components/grouped-list';
import { groupBy, sortBy } from 'lodash-es';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class GroupedListComponent extends Component {
  /**
   * @property {Object} groupConfigs - contains map from [group] -> config
   */
  groupConfigs = {};

  /**
   * @property {String} groupedListClass - the class to apply to this element
   */
  groupedListClass = 'grouped-list';

  /**
   * @property {String} containerQuerySelector - a query selector to get the parent element of this instance
   */
  get containerQuerySelector() {
    const { containerSelector, groupedListClass, parentView } = this;
    if (containerSelector) {
      return containerSelector;
    }
    if (!parentView || !parentView.element) {
      return 'body';
    }
    const parentClasses = parentView.element.querySelector(`.${groupedListClass}`).parentElement.classList.value;
    const parentSelector = parentClasses
      .split(' ')
      .filter(cls => cls.length)
      .map(cls => `.${cls}`)
      .join('');
    return parentSelector;
  }

  /*
   * @property {Object} groupedItems - object with keys as group names and the values as items in the group
   */
  @computed('items', 'groupByField', 'sortByField')
  get groupedItems() {
    const { items, groupByField, sortByField } = this;

    let grouped = groupBy(items, row => row[groupByField].split(',')[0]);

    if (!isBlank(sortByField)) {
      Object.entries(grouped).forEach(([key, value]) => {
        grouped[key] = sortBy(value, [sortByField]);
      });
    }

    return grouped;
  }

  @computed('groupedItems', 'groupConfigs', 'shouldOpenAllGroups')
  get flatItems() {
    const { groupedItems, shouldOpenAllGroups, groupConfigs } = this;
    return Object.keys(groupedItems).reduce((items, name) => {
      const groupItems = groupedItems[name];
      const isOpen = getWithDefault(groupConfigs, `${name}.isOpen`, false) || shouldOpenAllGroups;

      items.push({ name, groupLength: groupItems.length, _isGroup: true, _isOpen: isOpen });
      if (isOpen) {
        items.push(...groupItems);
      }
      return items;
    }, []);
  }

  @action
  toggleOpen(group) {
    const { groupConfigs } = this;
    groupConfigs[group] = groupConfigs[group] || {};
    groupConfigs[group].isOpen = !this.groupConfigs[group].isOpen;

    set(this, 'groupConfigs', Object.assign({}, groupConfigs));
  }
}

export default GroupedListComponent;

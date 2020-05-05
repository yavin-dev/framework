/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Base Component
 *
 * Usage:
 *  <NaviColumnConfig::Item
 *    @column={{this.column}}
 *    @onRemoveColumn={{fn this.removeColumn this.column}}
 *  />
 */
import Component from '@ember/component';
import { set, action } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/navi-column-config/item';
import { A as arr } from '@ember/array';
import { debounce, next } from '@ember/runloop';

@tagName('')
@templateLayout(layout)
class NaviColumnConfigItemComponent extends Component {
  /**
   * @property {String} isColumnConfigOpen - the open/closed state of this column's config
   */
  isColumnConfigOpen = false;

  /**
   * @method doUpdateColumnName - update the display name of the current column in the visualization metadata
   * @param {String} newName
   */
  doUpdateColumnName(newName) {
    const {
      visualization: { metadata },
      column
    } = this;

    if (metadata && column) {
      if (!metadata.style?.aliases) {
        set(metadata, 'style', { aliases: arr([]) });
      }

      const { aliases } = metadata.style;
      const existingAlias = aliases.find(alias => alias.name === column.name && alias.type === column.type);

      if (existingAlias) {
        if (newName === '') {
          aliases.removeObject(existingAlias);
        } else {
          set(existingAlias, 'as', newName);
        }
      } else if (newName !== '') {
        aliases.pushObject({
          type: column.type,
          name: column.name,
          as: newName
        });
      }
    }
  }

  /**
   * @action
   * @param {String} newName - New display name for the current column
   */
  @action
  updateColumnName(newName) {
    debounce(this, 'doUpdateColumnName', newName, 300);
  }

  /**
   * Stores element reference after render.
   * If the column was just added, open the config and scroll to element
   * @param element - element inserted
   */
  @action
  setupElement(element) {
    this.componentElement = element;

    if (this.isLastAdded) {
      set(this, 'isColumnConfigOpen', true);
      next(() => {
        element.parentElement.scrollTop = element.offsetTop - element.parentElement.offsetTop;
      });
    }
  }
}

export default NaviColumnConfigItemComponent;

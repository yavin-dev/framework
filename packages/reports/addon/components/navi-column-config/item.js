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
   * If the column was just added, opens the config and scrolls to the element
   * @param element - element inserted
   */
  @action
  setupElement(element) {
    this.componentElement = element;

    if (this.isLastAdded) {
      this.onOpenColumn(this.column);
      next(this, 'scrollToElement');
    }
  }

  /**
   * @method scrollToElement - set the scroll position of the column config to the current item
   */
  scrollToElement() {
    this.componentElement.parentElement.scrollTop =
      this.componentElement.offsetTop - this.componentElement.parentElement.offsetTop;
  }

  /**
   * When the column is last added, opens it, highlights it and scrolls to it.
   * Typically this is performed only once when inserted (in `setupElement`).
   * The only current use case is for the date time column, which is not re-rendered when clicked in the dimension selector.
   * @param element - the item element
   */
  @action
  onUpdateLastAdded(element) {
    const { column, isOpen, isLastAdded, onOpenColumn } = this;

    if (isLastAdded && column.type === 'timeDimension') {
      if (!isOpen) {
        onOpenColumn(column);
      }

      //restart the highlight animation https://css-tricks.com/restart-css-animation/
      element.classList.remove('navi-column-config-item--last-added');
      void element.offsetWidth;
      element.classList.add('navi-column-config-item--last-added');

      next(this, 'scrollToElement');
    }
  }
}

export default NaviColumnConfigItemComponent;

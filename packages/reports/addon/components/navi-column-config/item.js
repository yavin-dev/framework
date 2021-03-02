/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Base Component
 *
 * Usage:
 *  <NaviColumnConfig::Item
 *    @column={{this.column}}
 *    @isLastAdded={{eq column.fragment @lastAddedColumn}}
 *    @isOpen={{eq column.fragment this.currentlyOpenColumn.fragment}}
 *    @onOpenColumn={{this.openColumn}}
 *    @onRemoveColumn={{fn @onRemoveColumn column.fragment}}
 *    @cloneColumn={{fn this.cloneColumn column}}
 *    @onAddFilter={{fn @onAddFilter column}}
 *    @onRenameColumn={{fn @onRenameColumn column.fragment}}
 *    @onUpdateColumnParam={{fn @onUpdateColumnParam column.fragment}}
 *  />
 */
import Component from '@ember/component';
import { action } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/navi-column-config/item';
import { next } from '@ember/runloop';

@tagName('')
@templateLayout(layout)
class NaviColumnConfigItemComponent extends Component {
  /**
   * @property {String} isColumnConfigOpen - the open/closed state of this column's config
   */
  isColumnConfigOpen = false;

  /**
   * Stores element reference after render.
   * If the column was last added, opens the config and scrolls to the element
   * @param element - element inserted
   */
  @action
  setupElement(element) {
    this.componentElement = element;

    if (this.isLastAdded) {
      this.onOpenColumn(this.column);
      next(() => {
        this.scrollToElement();
        this.highlightElement();
      });
    }
  }

  /**
   * Opens and highlights the column (if it is not already open) and scrolls to it.
   * This is done for the date time column since it is not re-rendered when clicked via the dimension selector.
   * For other columns, it is performed only once when inserted (in `setupElement`).
   */
  @action
  onUpdateLastAdded() {
    const { column, isOpen, isLastAdded, onOpenColumn } = this;

    if (isLastAdded && column.name === 'dateTime') {
      if (!isOpen) {
        onOpenColumn(column);
        next(this, 'highlightElement');
      }

      next(this, 'scrollToElement');
    }
  }

  /**
   * Opens the column
   */
  @action
  openColumn() {
    const { column, isOpen, onOpenColumn, componentElement } = this;
    onOpenColumn(isOpen ? null : column);

    //headers of columns with a long config might not be in the viewport
    next(() => {
      if (
        componentElement.parentElement.scrollTop >
        componentElement.offsetTop - componentElement.parentElement.offsetTop
      ) {
        this.scrollToElement();
      }
    });
  }

  /**
   * @method scrollToElement - sets the scroll position of the column config to the current item
   */
  scrollToElement() {
    this.componentElement.parentElement.scrollTop =
      this.componentElement.offsetTop - this.componentElement.parentElement.offsetTop;
  }

  /**
   * @method highlightElement - adds a highlighting animation to the element
   */
  highlightElement() {
    this.componentElement.classList.add('navi-column-config-item--last-added');
  }
}

export default NaviColumnConfigItemComponent;

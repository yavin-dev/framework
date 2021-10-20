/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Request Column Config Item Component
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { next } from '@ember/runloop';
import { assert } from '@ember/debug';
import type { ConfigColumn } from '../navi-column-config';
import type ColumnFragment from 'navi-core/models/fragments/column';
import type { SortDirection } from 'navi-data/adapters/facts/interface';

interface Args {
  column: ConfigColumn;
  isLastAdded: boolean;
  isOpen: boolean;
  onOpenColumn(column: ConfigColumn | null): void;
  onRemoveColumn(): void;
  cloneColumn(): void;
  onAddFilter(): void;
  onUpsertSort(direction: SortDirection): void;
  onRemoveSort(): void;
  onRenameColumn(alias?: string): void;
  toggleRollup(): void;
  supportsSubtotal: boolean;
  onUpdateColumnParam(paramId: string, paramValue: ColumnFragment['parameters'][string]): void;
}

export default class NaviColumnConfigItemComponent extends Component<Args> {
  /**
   * Whether the current item should show a handle for reordering
   */
  @tracked canDrag = false;

  componentElement!: HTMLElement;

  /**
   * Checks if the current component is being placed by a drag and drop
   * @returns true when the current item is being dropped
   */
  isDragDrop() {
    return this.componentElement.classList.contains('is-dropping');
  }

  /**
   * Stores element reference after render.
   * If the column was last added, opens the config and scrolls to the element
   * @param element - element inserted
   */
  @action
  setupElement(element: HTMLElement) {
    this.componentElement = element;

    if (this.args.isLastAdded) {
      this.args.onOpenColumn(this.args.column);
      next(() => {
        this.scrollToElement();
        this.highlightElement();
      });
    }
  }

  /**
   * Opens the column
   */
  @action
  openColumn() {
    if (this.isDragDrop()) {
      return;
    }
    const { column, isOpen, onOpenColumn } = this.args;
    const { componentElement } = this;
    onOpenColumn(isOpen ? null : column);

    //headers of columns with a long config might not be in the viewport
    next(() => {
      const { parentElement, offsetTop } = componentElement;
      assert('Component should have a parent', parentElement);
      if (parentElement.scrollTop > offsetTop - parentElement.offsetTop) {
        this.scrollToElement();
      }
    });
  }

  /**
   * sets the scroll position of the column config to the current item
   */
  scrollToElement() {
    const { parentElement, offsetTop } = this.componentElement;
    assert('Component should have a parent', parentElement);
    parentElement.scrollTop = offsetTop - parentElement.offsetTop;
  }

  /**
   * adds a highlighting animation to the element
   */
  highlightElement() {
    this.componentElement.classList.add('navi-column-config-item--last-added');
  }
}

/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This component won't be used directly. It is passed to ember-light-table as a custom cell component.
 * Ember-light-table will pass any parameters in through the value attribute.
 *
 * <DirItemNameCell
 *  @value={{@item}}
 * />
 */
import Component from '@glimmer/component';

interface DirItemNameCellComponentArgs {
  value: TODO<{ constructor: { modelName: string }; modelId: string }>;
}

export default class DirItemLabelCellComponent extends Component<DirItemNameCellComponentArgs> {
  /**
   * @property {String} itemId - the id of the model or the tempId of an unsaved model
   */
  get itemId() {
    return this.args.value?.modelId;
  }
}

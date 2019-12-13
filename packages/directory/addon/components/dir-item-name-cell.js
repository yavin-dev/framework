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
import fileTypes from 'navi-directory/utils/enums/file-types';
import { get } from '@ember/object';
import { pluralize } from 'ember-inflector';

export default class DirItemNameCellComponent extends Component {
  /**
   * @property {String} itemLink - the route that this component should link to (without the id)
   */
  get itemLink() {
    const { type } = this,
      pluralType = pluralize(type);

    return `${pluralType}.${type}`;
  }

  /**
   * @property {String} itemId - the id of the model or the tempId of an unsaved model
   */
  get itemId() {
    return get(this, 'args.value.modelId');
  }

  /**
   * @property {String} type - the type of the item
   */
  get type() {
    const value = this.args.value || {};
    return get(value, 'constructor.modelName');
  }

  /**
   * @property {String} iconClass - the icon class that is passed to navi-icon
   */
  get iconClass() {
    const type = pluralize(this.type);
    return get(fileTypes, `definitions.${type}.iconClass`);
  }
}

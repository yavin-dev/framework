/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This component won't be used directly. It is passed to ember-light-table as a custom cell component.
 * Ember-light-table will pass any parameters in through the value attribute.
 *
 * <DirItemNameCell
 *  @value={{item}}
 * />
 */

import { readOnly } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../templates/components/dir-item-name-cell';
import fileTypes from 'navi-directory/utils/enums/file-types';
import { get, computed } from '@ember/object';
import { pluralize } from 'ember-inflector';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class DirItemNameCell extends Component {
  /**
   * @property {String} itemLink - the route that this component should link to (without the id)
   */
  @computed('type')
  get itemLink() {
    const { type } = this,
      pluralType = pluralize(type);

    return `${pluralType}.${type}`;
  }

  /**
   * @property {String} itemId - the id of the model or the tempId of an unsaved model
   */
  @readOnly('value.modelId')
  itemId;

  /**
   * @property {String} type - the type of the item
   */
  @computed('value')
  get type() {
    const value = get(this, 'value') || {};
    return get(value, 'constructor.modelName');
  }

  /**
   * @property {String} iconClass - the icon class that is passed to navi-icon
   */
  @computed('type')
  get iconClass() {
    const type = pluralize(this.type);
    return get(fileTypes, `definitions.${type}.iconClass`);
  }
}

export default DirItemNameCell;

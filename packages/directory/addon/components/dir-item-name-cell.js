/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This component won't be used directly. It is passed to ember-light-table as a custom cell component.
 * Ember-light-table will pass any parameters in through the value attribute.
 *
 * {{dir-item-name-cell
 *  value=item
 * }}
 */

import Component from '@ember/component';
import layout from '../templates/components/dir-item-name-cell';
import fileTypes from 'navi-directory/utils/enums/file-types';
import { get, computed } from '@ember/object';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName
   */
  tagName: '',

  /**
   * @property {String} itemLink - the route that this component should link to (without the id)
   */
  itemLink: computed('type', function() {
    let type = get(this, 'type'),
        singularType = type.slice(0, -1);

    return `${type}.${singularType}`;
  }),

  /**
   * @property {String} type - the type of the item
   */
  type: computed('value', function() {
    return get(this, 'value').serialize().data.type;
  }),

  /**
   * @property {String} iconClass - the icon class that is passed to navi-icon
   */
  iconClass: computed('type', function() {
    let type = get(this, 'type');

    return get(fileTypes, `definitions.${type}.iconClass`);
  })
});

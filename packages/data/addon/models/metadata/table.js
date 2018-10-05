/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';

import { assign } from '@ember/polyfills';
import { getOwner } from '@ember/application';

let Model = EmberObject.extend({
  /**
   * @property {String} name
   */
  name: undefined,

  /**
   * @property {String} longName
   */
  longName: undefined,

  /**
   * @property {String} description
   */
  description: undefined,

  /**
   * @property {String} category
   */
  category: undefined,

  /**
   * @property {Array} timeGrains - array of timeGrain models
   */
  timeGrains: undefined,

  /**
   * @method init
   * Converts timeGrains to timeGrain fragment objects
   */
  init() {
    let timeGrains = this.get('timeGrains');
    if (timeGrains) {
      this.set(
        'timeGrains',
        timeGrains.map(timeGrain => {
          let timeGrainPayload = assign({}, timeGrain),
            owner = getOwner(this);
          return owner.factoryFor('model:metadata/time-grain').create(timeGrainPayload);
        })
      );
    }
  }
});

//factory level properties
export default Model.reopenClass({
  /**
   * @property {String} identifierField - used by the keg as identifierField
   */
  identifierField: 'name'
});

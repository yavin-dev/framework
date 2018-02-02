/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#pick-container as |selection|}}
 *      {{#pick-value}}
 *          <span>Your currently selected value is {{selection}}</span>
 *      {{/pick-value}}
 *   {{/pick-container}}
 */
import PickInnerComponent from './pick-inner-component';

export default PickInnerComponent.extend({
  classNames: ['pick-value'],

  componentName: 'pick-value',

  /**
   * @method click - sends `valueClicked` action to pick-container
   * @override
   */
  click() {
    this._super(...arguments);

    this.send('valueClicked');
  }
});

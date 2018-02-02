/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#pick-container}}
 *      {{#pick-form}}
 *          <div {{action 'updateSelection' 'green'}}>Select Green</div>
 *          <div {{action 'updateSelection' 'red'}}>Select Red</div>
 *      {{/pick-form}}
 *   {{/pick-container}}
 */
import PickInnerComponent from './pick-inner-component';

export default PickInnerComponent.extend({
  classNames: ['pick-form'],

  componentName: 'pick-form',

  isVisible: false
});

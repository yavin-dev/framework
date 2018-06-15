/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Lazy render nested component when event triggers
 *
 * Usage:
 *   {{#lazy-render
 *      on='mouseenter'
 *      target='targe'
 *   }}
 *      {{component}}
 *   {{/lazy-render}}
 */

import Ember from 'ember';
import $ from 'jquery';
import layout from '../templates/components/lazy-render';

const { get, set, computed } = Ember;

export default Ember.Component.extend({
  layout,

  tagName: '',

  /**
   * @property {Boolean} shouldRender
   */
  shouldRender: false,

  /**
   * @property {String} on - Event for triggering render
   */
  on: 'mouseenter',

  /**
   * @property {String} target - jQuery selector for element to attach event handler too
   */
  target: undefined,

  /**
   * @property {String} target
   */
  $target: computed('target', function() {
    let target = get(this, 'target');

    Ember.assert('target property is required', target);
    return $(target);
  }),

  /**
   * @method didInsertElement
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    let $target = get(this, '$target'),
      on = get(this, 'on');

    $target.on(`${on}.lazy-render`, () => {
      $target.off(`${on}.lazy-render`);
      set(this, 'shouldRender', true);
    });
  },

  /**
   * @method willDestroyElement
   * @override
   */
  willDestroyElement() {
    this._super(...arguments);

    const $target = get(this, '$target'),
      on = get(this, 'on');

    $target.off(`${on}.lazy-render`);
  }
});

/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Lazy render nested component when event triggers
 *
 * Usage:
 *   <LazyRender
 *      @on="mouseenter"
 *      @target=".my-selector"
 *   >
 *      Inner Template
 *   </LazyRender>
 */

import { assert } from '@ember/debug';
import Component from '@ember/component';
import { computed, set } from '@ember/object';
import layout from '../templates/components/lazy-render';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class LazyRenderComponent extends Component {
  /**
   * @property {Boolean} shouldRender
   */
  shouldRender = false;

  /**
   * @property {String} on - Event for triggering render
   */
  on = 'mouseenter';

  /**
   * @property {String} target - element selector for element to attach event handler too
   */
  target = undefined;

  /**
   * @property {String} target
   */
  @computed('target')
  get targetElement() {
    const { target } = this;
    assert('target property is required', target);
    return document.querySelector(target);
  }

  /**
   * @method didInsertElement
   * @override
   */
  didInsertElement() {
    super.didInsertElement(...arguments);

    const { targetElement, on } = this;
    targetElement.addEventListener(
      on,
      () => {
        if (!this.isDestroyed && !this.isDestroying) {
          set(this, 'shouldRender', true);
        }
      },
      { once: true }
    );
  }
}

export default LazyRenderComponent;

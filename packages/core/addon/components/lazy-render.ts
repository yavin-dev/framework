/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Lazy render nested component when event triggers
 *
 * Usage:
 *   <LazyRender
 *      @target=".my-selector"
 *   >
 *      Inner Template
 *   </LazyRender>
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { tracked } from '@glimmer/tracking';

interface Args {
  target: string;
  shouldRender?: boolean;
  on?: string;
}

export default class LazyRenderComponent extends Component<Args> {
  @tracked shouldRender = false;
  on = 'mouseenter';

  constructor() {
    //@ts-ignore
    super(...arguments);

    const { targetElement } = this;
    targetElement.addEventListener(this.on, this.render, { once: true });
  }

  @action
  render() {
    if (!this.isDestroyed && !this.isDestroying) {
      this.shouldRender = true;
    }
  }

  get targetElement(): HTMLElement {
    const { target } = this.args;
    assert('target property is required', target);
    const element = document.querySelector(target);
    assert('The targetElement must be found', element);
    return element as HTMLElement;
  }
}

/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <NaviColumnConfig
 *    @isOpen={{true}}
 *    @drawerDidChange={{this.callback}}
 *  />
 */
import Component from '@ember/component';
import layout from '../templates/components/navi-column-config';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

const noop = () => null;
@tagName('')
@templateLayout(layout)
class NaviColumnConfig extends Component {
  /**
   * Stores element reference after render
   * @param element - element inserted
   */
  @action
  setupElement(element) {
    this.componentElement = element;
  }

  /**
   * Drawer transition
   * @param context - animation context
   */
  @action
  *drawerTransition({ insertedSprites, removedSprites }) {
    const offset = 500; // 2x the size of the drawer
    const x = this.componentElement.getBoundingClientRect().left - offset;
    yield Promise.all([
      ...removedSprites.map(sprite => {
        sprite.applyStyles({ 'z-index': '1' });
        sprite.endAtPixel({ x });
        return move(sprite, { easing: easeIn });
      }),
      ...insertedSprites.map(sprite => {
        sprite.startAtPixel({ x });
        sprite.applyStyles({ 'z-index': '1' });
        return move(sprite, { easing: easeOut });
      })
    ]);
    const { drawerDidChange = noop } = this;
    drawerDidChange();
  }
}
export default NaviColumnConfig;

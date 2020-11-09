/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{missing-intervals-warning
 *       response=response
 *       onDetailsToggle=(action 'resizeVisualization')
 *   }}
 */
import { notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import moment from 'moment';
import layout from '../templates/components/missing-intervals-warning';
import fade from 'ember-animated/transitions/fade';
import { Resize } from 'ember-animated/motions/resize';
import move from 'ember-animated/motions/move';
import { easeOut } from 'ember-animated/easings/cosine';

const DATE_FORMAT = 'YYYY[/]MM[/]DD';

export default class MissingIntervalWarning extends Component {
  layout = layout;

  /**
   * @property {String} tagName
   */
  tagName = '';

  /**
   * @property {Array} classNames
   */

  /**
   * @property {Array} missingIntervals - The formatted intervals displayed in the details section
   */
  @computed('response.meta.missingIntervals')
  get missingIntervals() {
    let rawIntervals = get(this, 'response.meta.missingIntervals') || [];

    return rawIntervals.map(interval => {
      //Make both dates in the interval inclusive
      let dates = interval.split('/'),
        start = new moment(dates[0]).format(DATE_FORMAT),
        end = new moment(dates[1]).subtract(1, 'second').format(DATE_FORMAT);

      //If the interval only covers one day, return just that date
      return start === end ? start : `${start} - ${end}`;
    });
  }

  /**
   * @property {Boolean} showDetails - Determines whether the component is expanded or collapsed
   */
  showDetails = false;

  /**
   * @property {Boolean} warningEnabled - Shows the warning if missing intervals are present
   */
  @notEmpty('missingIntervals')
  warningEnabled;

  /**
   * @property fadeTransition - fade transition
   */
  fadeTransition = fade;

  /**
   * @param drawerTransition - drawer transition
   */
  *drawerTransition({ insertedSprites }) {
    const y = document.querySelector('.missing-intervals-warning').getBoundingClientRect().bottom;
    yield Promise.all(
      insertedSprites.map(sprite => {
        sprite.startAtPixel({ y });
        sprite.applyStyles({ 'z-index': '1' });
        return move(sprite, { easing: easeOut, duration: 1000 });
      })
    );
  }

  /**
   * @property resizeMotion - resize motion with callback
   */
  get resizeMotion() {
    const { onDetailsToggle } = this;
    return class extends Resize {
      *animate() {
        yield* super.animate();
        onDetailsToggle();
      }
    };
  }
}

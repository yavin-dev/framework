/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <MissingIntervalsWarning
 *     @response={{this.response}}
 *     @onDetailsToggle={{this.resizeVisualization}}
 *   />
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
//@ts-ignore
import fade from 'ember-animated/transitions/fade';
import { Resize } from 'ember-animated/motions/resize';
//@ts-ignore
import move from 'ember-animated/motions/move';
import { easeOut } from 'ember-animated/easings/cosine';
import type NaviFactResponse from '@yavin/client/models/navi-fact-response';
import type TransitionContext from 'ember-animated/-private/transition-context';

interface Args {
  response: NaviFactResponse;
  onDetailsToggle: () => void;
}

const DATE_FORMAT = 'YYYY[/]MM[/]DD';

export default class MissingIntervalWarning extends Component<Args> {
  /**
   * Determines whether the component is expanded or collapsed
   */
  @tracked showDetails = false;

  /**
   * The formatted intervals displayed in the details section
   */
  get missingIntervals() {
    let rawIntervals = this.args.response.meta.missingIntervals || [];

    return rawIntervals.map((interval) => {
      //Make both dates in the interval inclusive
      const dates = interval.split('/');
      const start = moment(dates[0]).format(DATE_FORMAT);
      const end = moment(dates[1]).subtract(1, 'second').format(DATE_FORMAT);

      //If the interval only covers one day, return just that date
      return start === end ? start : `${start} - ${end}`;
    });
  }

  /**
   * gets any warning messages.
   */
  get warningMessages() {
    return this.args.response.meta.warning || [];
  }

  /**
   * Shows the warning if missing intervals or warnings are present
   */
  get warningEnabled() {
    return this.missingIntervals.length > 0 || this.warningMessages.length > 0;
  }

  /**
   * fade transition
   */
  fadeTransition = fade;

  /**
   * @param drawerTransition - drawer transition
   */
  *drawerTransition({ insertedSprites }: TransitionContext) {
    const y = document.querySelector('.missing-intervals-warning')?.getBoundingClientRect().bottom;
    yield Promise.all(
      insertedSprites.map((sprite) => {
        sprite.startAtPixel({ y });
        return move(sprite, { easing: easeOut, duration: 500 });
      })
    );
  }

  /**
   * resizeMotion - resize motion with callback
   */
  get resizeMotion(): typeof Resize {
    const { onDetailsToggle } = this.args;
    return class extends Resize {
      *animate() {
        yield* super.animate();
        onDetailsToggle();
      }
    };
  }
}

/**
 * Copyright 2018, Yahoo Holdings Inc.
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
import Moment from 'moment';
import layout from '../templates/components/missing-intervals-warning';

const DATE_FORMAT = 'YYYY[/]MM[/]DD';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName
   */
  tagName: '',

  /**
   * @property {Array} classNames
   */
  classNames: ['missing-intervals-warning'],

  /**
   * @property {Array} missingIntervals - The formatted intervals displayed in the details section
   */
  missingIntervals: computed('response', function() {
    let rawIntervals = get(this, 'response.meta.missingIntervals') || [];

    return rawIntervals.map(interval => {
      //Make both dates in the interval inclusive
      let dates = interval.split('/'),
        start = new Moment(dates[0]).format(DATE_FORMAT),
        end = new Moment(dates[1]).subtract(1, 'second').format(DATE_FORMAT);

      //If the interval only covers one day, return just that date
      return start === end ? start : `${start} - ${end}`;
    });
  }),

  /**
   * @property {Boolean} showDetails - Determines whether the component is expanded or collapsed
   */
  showDetails: false,

  /**
   * @property {Boolean} warningEnabled - Shows the warning if missing intervals are present
   */
  warningEnabled: notEmpty('missingIntervals')
});

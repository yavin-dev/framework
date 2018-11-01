/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/dimension-date-range
 *       filter=filter
 *       request=request
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import Component from '@ember/component';
import layout from '../../templates/components/filter-values/date-range';
import { get } from '@ember/object';

export default Component.extend({
  layout,

  classNames: ['dimension-date-range', 'date-range'],

  actions: {
    /**
     * @action setInterval
     * @param {Interval} interval - new interval to set in filter
     */
    setInterval(interval) {
      let intervalStr = interval.asStrings('YYYY-MM-DD');

      this.attrs.onUpdateFilter({
        values: [`${get(intervalStr, 'start')}/${get(intervalStr, 'end')}`]
      });
    }
  }
});

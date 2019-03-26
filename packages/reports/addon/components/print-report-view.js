/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{print-report-view
 *    report=report
 *    response=response
 *  }}
 */

import Component from '@ember/component';

import { get, computed } from '@ember/object';
import layout from '../templates/components/print-report-view';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['print-report-view'],

  /**
   * @property {Boolean} hasNoData - whether or not there is data to display
   */
  hasNoData: computed('response.meta.pagination.numberOfResults', function() {
    return get(this, 'response.meta.pagination.numberOfResults') === 0;
  })
});

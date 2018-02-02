/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/chart-type/date-time
 *    request=request
 *    response=response
 *    seriesConfig=seriesConfig
 * }}
 */

import Ember from 'ember';
import layout from '../../../templates/components/visualization-config/chart-type/date-time';

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['date-time-line-chart-config'],
});

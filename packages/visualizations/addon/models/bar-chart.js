/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import LineChart from './line-chart';

export default LineChart.extend({
  type:  DS.attr('string', { defaultValue: 'bar-chart'})
});

/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/wrapper
 *    request=request
 *    response=response
 *    visualization=visualization
 *    onUpdateConfig=(action 'onUpdateConfig')
 * }}
 */

import Ember from 'ember';
import layout from '../../templates/components/visualization-config/wrapper';

export default Ember.Component.extend({
  layout,

  classNames: [ 'visualization-config' ]
});

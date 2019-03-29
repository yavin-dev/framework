/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/wrapper
 *    request=request
 *    response=response
 *    visualization=visualization
 *    onUpdateConfig=(action 'onUpdateConfig')
 * }}
 */

import Component from '@ember/component';
import layout from '../../templates/components/visualization-config/wrapper';

export default Component.extend({
  layout,

  classNames: ['visualization-config']
});

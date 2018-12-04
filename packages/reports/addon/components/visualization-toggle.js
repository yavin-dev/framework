/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{visualization-toggle
 *    report=report
 *    validVisualizations=validVisualizations
 *    onVisualizationTypeUpdate=(action 'onVisualizationTypeUpdate')
 *  }}
 */
import Component from '@ember/component';
import layout from '../templates/components/visualization-toggle';

export default Component.extend({
  layout
});

/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{navi-visualization-config/goal-gauge
 *    request=request
 *    response=response
 *    options=options
 *  }}
 */
import Component from '@ember/component';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import layout from '../../templates/components/navi-visualization-config/goal-gauge';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class NaviVisualizationConfigGoalGaugeComponent extends Component {
  /**
   * @property {object} metric fragment
   */
  @alias('request.metrics.firstObject') metricModel;

  /**
   * @action updateConfig
   */
  @action
  updateConfig(type, value) {
    const { onUpdateConfig } = this;

    if (onUpdateConfig) onUpdateConfig({ [type]: value });
  }
}

export default NaviVisualizationConfigGoalGaugeComponent;

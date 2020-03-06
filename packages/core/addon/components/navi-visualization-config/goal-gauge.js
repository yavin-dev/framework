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
import layout from '../../templates/components/navi-visualization-config/goal-gauge';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class NaviVisualizationConfigGoalGaugeComponent extends Component {
  /**
   * @action updateConfig
   */
  @action
  updateConfig(type, value) {
    this.onUpdateConfig?.({ [type]: value });
  }
}

export default NaviVisualizationConfigGoalGaugeComponent;

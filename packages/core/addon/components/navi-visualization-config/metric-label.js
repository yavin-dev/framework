/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{navi-visualization-config/metric-label
 *    request=request
 *    response=response
 *    options=options
 *    onUpdateConfig=(action 'onUpdateConfig')
 *  }}
 */
import Component from '@ember/component';
import { action } from '@ember/object';
import layout from '../../templates/components/navi-visualization-config/metric-label';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class NaviVisualizationConfigMetricLabelComponent extends Component {
  /**
   * @action updateLabel
   * @param {InputEvent} event - date string input event
   */
  @action
  updateLabel(description) {
    const { onUpdateConfig } = this;

    if (onUpdateConfig) onUpdateConfig({ description });
  }

  /**
   * @action updateFormat
   */
  @action
  updateFormat(format) {
    const { onUpdateConfig } = this;

    if (onUpdateConfig) onUpdateConfig({ format });
  }
}

export default NaviVisualizationConfigMetricLabelComponent;

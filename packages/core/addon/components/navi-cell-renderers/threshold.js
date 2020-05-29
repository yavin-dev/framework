/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::Threshold
 *   @data={{this.row}}
 *   @column={{this.column}}
 *   @request={{this.request}}
 * />
 */

import MetricRender from 'navi-core/components/navi-cell-renderers/metric';
import { computed } from '@ember/object';
import layout from '../../templates/components/navi-cell-renderers/threshold';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class ThresholdCellRenderer extends MetricRender {
  /**
   * @property {String} - classname binding to render the actual metric value
   */
  @computed('metricValue')
  get valueIndicator() {
    const metricValue = this.metricValue;

    if (metricValue > 0) {
      return 'strong';
    }
    if (metricValue < 0) {
      return 'weak';
    }

    return 'neutral';
  }
}

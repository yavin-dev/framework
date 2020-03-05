/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{navi-visualization-config/line-chart
 *    request=request
 *    response=response
 *    options=chartOptions
 *    type=visualizationType
 *    onUpdateConfig=(action 'onUpdateChartConfig')
 * }}
 */

import Component from '@ember/component';
import { set, get, computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { getOwner } from '@ember/application';
import { copy } from 'ember-copy';
import layout from '../../templates/components/navi-visualization-config/line-chart';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class NaviVisualizationConfigLineChartComponent extends Component {
  curveOptions = ['line', 'spline', 'step'];

  /**
   * @property {String} typePrefix - prefix for the line chart component
   */
  typePrefix = 'navi-visualization-config/chart-type/';

  /**
   * @property {Boolean} showStackOption - whether to display the `stacked` toggle
   */
  @computed('type', 'request')
  get showStackOption() {
    const { type, request } = this;
    const visualizationManifest = getOwner(this).lookup(`navi-visualization-manifest:${type}`);

    return visualizationManifest.hasGroupBy(request) || visualizationManifest.hasMultipleMetrics(request);
  }

  /**
   * @property {Object} seriesConfig
   */
  @computed('options')
  get seriesConfig() {
    return get(this, 'options.axis.y.series.config');
  }

  /**
   * @property {String} seriesType
   */
  @readOnly('options.axis.y.series.type') seriesType;

  /**
   * Method to replace the seriesConfig in visualization config object.
   *
   * @method onUpdateConfig
   * @param {Object} seriesConfig
   */
  @action
  onUpdateSeriesConfig(seriesConfig) {
    const newOptions = copy(this.options);
    set(newOptions, 'axis.y.series.config', seriesConfig);
    this.onUpdateConfig(newOptions);
  }

  /**
   * Updates line chart style
   *
   * @method onUpdateStyle
   * @param {String} field - which setting is getting updated, currently `curve` and `area`
   * @param {String|Boolean} - value to update the setting with.
   */
  @action
  onUpdateStyle(field, value) {
    const options = get(this, 'options');
    let newOptions = copy(options);
    set(newOptions, 'style', Object.assign({}, newOptions.style, { [field]: value }));
    this.onUpdateConfig(newOptions);
  }
}

export default NaviVisualizationConfigLineChartComponent;

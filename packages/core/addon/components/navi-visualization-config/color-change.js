/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * <NaviVisualizationConfig::ColorChange
 *   @request={{@request}}
 *   @response={{@response}}
 *   @seriesConfig={{readonly @options.series.config}}
 *   @seriesType={{readonly @options.series.type}}
 *   @onUpdateConfig={{this.onUpdateSeriesConfig}}
 * />
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { set, computed, action } from '@ember/object';
import { copy } from 'ember-copy';
import { tagName } from '@ember-decorators/component';

@tagName('')
class NaviVisualizationConfigColorChangeComponent extends Component {
  @tracked selectedLabelColor;

  /**
   * @property {Array} labels
   */
  @computed('args.{response,seriesConfig}')
  get labelColors() {
    const labelTypes = this.args.seriesConfig.dimensions.map(item => item.dimension + '|desc');
    let labels = this.args.response.map(row => {
      return labelTypes.map(labelType => row[labelType]).join(', ');
    });
    return labels.map((item, index) => {
      return {
        label: item,
        color: this.args.seriesConfig.colors[index]
      };
    });
  }

  @action
  selectedNewLabel(labelColor) {
    this.selectedLabelColor = labelColor;
  }

  /**
   * @method updateChartColor
   */
  @action
  updateChartColor() {
    const newColors = this.labelColors.map(item => {
      if (item.label === this.selectedLabelColor.label) {
        return document.getElementById('color-change__color-select').value;
      }
      return item.color;
    });
    const newConfig = copy(this.args.seriesConfig);
    set(newConfig, `colors`, newColors);
    this.args.onUpdateConfig(newConfig);
  }
}

export default NaviVisualizationConfigColorChangeComponent;

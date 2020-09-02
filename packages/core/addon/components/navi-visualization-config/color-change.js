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
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';

@tagName('')
class NaviVisualizationConfigColorChangeComponent extends Component {
  @tracked selectedLabelColor = null;

  /**
   * @property {Array} labels
   */
  get labelColors() {
    const labelTypes = this.args.seriesConfig.dimensions.map(item => item.id + '|desc');
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
  updateChartColor(event) {
    if (this.selectedLabelColor !== null) {
      const newColors = this.labelColors.map(item => {
        if (item.label === this.selectedLabelColor.label) {
          return event.target.value;
        }
        return item.color;
      });
      this.args.onUpdateConfig(newColors);
    }
    this.selectedLabelColor = null;
  }
}

export default NaviVisualizationConfigColorChangeComponent;

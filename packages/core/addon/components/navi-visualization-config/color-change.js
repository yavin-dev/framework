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
import { getRequestDimensions } from 'navi-core/utils/chart-data';
import { assignColors } from 'navi-core/utils/enums/denali-colors';

class NaviVisualizationConfigColorChangeComponent extends Component {
  @tracked selectedLabelColor = null;

  /**
   * @property {Array} labels
   */
  get labelColors() {
    const labelTypes = getRequestDimensions(this.args.request).map(item => item + '|desc');
    let labels = this.args.response.map(row => {
      return labelTypes.map(labelType => row[labelType]).join(', ');
    });
    let colors = assignColors(labels, this.args.seriesConfig.colors);
    return labels.map((item, index) => {
      return {
        label: item,
        color: colors[index]
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
      const colorSettings = this.args.seriesConfig.colors;
      // check if a color setting already exists for this label
      let newSetting = colorSettings.find(colorSetting => {
        return colorSetting.label === this.selectedLabelColor.label;
      });
      if (newSetting) {
        newSetting.color = event.target.value;
      } else {
        colorSettings.push({ label: this.selectedLabelColor.label, color: event.target.value });
      }
      this.args.onUpdateConfig(colorSettings);
    }
    this.selectedLabelColor = null;
  }
}

export default NaviVisualizationConfigColorChangeComponent;

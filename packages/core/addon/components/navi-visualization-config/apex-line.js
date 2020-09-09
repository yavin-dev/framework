/**
 * Usage:
 * <NaviVisualizationConfig::ApexLine
 *   @request=request
 *   @response=response
 *   @options=tableOptions
 * />
 */
import Component from '@glimmer/component';
import { set, action } from '@ember/object';
import { copy } from 'ember-copy';
import { tracked } from '@glimmer/tracking';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class NaviVisualizationConfigApexLineComponent extends Component {
  strokeOptions = ['straight', 'smooth', 'stepline'];
  @tracked chosenStroke = this.args.options?.series?.config?.stroke;

  /**
   * Method to update the config of the chart
   * @method updateLegendVisible
   * @param {string} type - the field of the config being updated
   * @param {boolean} value - the new value of the field being updated
   */
  @action
  updateChart(type, value) {
    if (type === 'stroke') {
      this.chosenStroke = value;
    }
    const newOptions = copy(this.args.options);
    set(newOptions, 'series.config.' + type, value);
    this.args.onUpdateConfig(newOptions);
  }
}

/**
 * Usage:
 * <NaviVisualizationConfig::ApexPie
 *   @request=request
 *   @response=response
 *   @options=tableOptions
 * />
 */
import Component from '@glimmer/component';
import { set, action } from '@ember/object';
import { copy } from 'ember-copy';
import { tagName } from '@ember-decorators/component';

@tagName('')
class NaviVisualizationConfigApexPieComponent extends Component {
  /**
   * Method to replace the seriesConfig in visualization config object.
   *
   * @method onUpdateConfig
   * @param {Object} seriesConfig
   */
  @action
  onUpdateSeriesConfig(seriesConfig) {
    const newOptions = copy(this.args.options);
    set(newOptions, 'series.config', seriesConfig);
    this.args.onUpdateConfig(newOptions);
  }
}

export default NaviVisualizationConfigApexPieComponent;

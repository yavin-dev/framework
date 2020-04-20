import Controller from '@ember/controller';
import { set, get, computed, action } from '@ember/object';
import { merge } from 'lodash-es';

export default class MetricLabelController extends Controller {
  request = {};

  @computed('model')
  get response() {
    return get(this, 'model.0.response.rows');
  }

  metricLabelOptions = {
    description: "Glass Bottles of the ranch's finest pasteurized whole milk!!!!!!!",
    metric: { metric: 'bottles', parameters: {} },
    format: '$0,0[.]00'
  };

  @computed('metricLabelOptions')
  get metricVisualization() {
    return {
      type: 'metric-label',
      version: 1,
      metadata: get(this, 'metricLabelOptions')
    };
  }

  /**
   * @action - onUpdateConfig merges config into the metricLabelOptions
   */
  @action
  onUpdateConfig(configUpdates) {
    const { metricLabelOptions: config } = this;
    set(this, 'metricLabelOptions', merge({}, config, configUpdates));
  }
}

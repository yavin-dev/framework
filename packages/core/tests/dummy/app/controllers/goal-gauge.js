import Controller from '@ember/controller';
import { set, get, computed, action } from '@ember/object';
import { merge } from 'lodash-es';

export default class GoalGaugeController extends Controller {
  request = {};

  @computed('model')
  get response() {
    return get(this, 'model.0.response.rows');
  }

  goalGaugeOptions = {
    metric: { metric: 'DAU', parameters: {} },
    baselineValue: '2900000000',
    goalValue: '3100000000'
  };

  @computed('goalGaugeOptions')
  get goalGaugeVisualization() {
    return {
      type: 'goal-gauge',
      version: 1,
      metadata: get(this, 'goalGaugeOptions')
    };
  }

  /**
   * @action - onUpdateConfig merges config into the metricLabelOptions
   */
  @action
  onUpdateConfig(configUpdates) {
    let config = get(this, 'goalGaugeOptions');
    set(this, 'goalGaugeOptions', merge({}, config, configUpdates));
  }
}

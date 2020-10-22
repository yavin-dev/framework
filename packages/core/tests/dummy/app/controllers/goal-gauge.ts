import Controller from '@ember/controller';
import { set, get, computed, action } from '@ember/object';
import { merge } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import { GoalGaugeConfig } from 'navi-core/models/goal-gauge';
import { ModelFrom } from 'navi-core/utils/type-utils';
import GoalGaugeRoute from '../routes/goal-gauge';

export default class GoalGaugeController extends Controller {
  model!: ModelFrom<GoalGaugeRoute>;

  request = {};
  @tracked goalGaugeOptions = {
    metricCid: this.model.firstObject?.request.metricColumns[0].cid,
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
  onUpdateConfig(configUpdates: Partial<GoalGaugeConfig>) {
    const { goalGaugeOptions: config } = this;
    set(this, 'goalGaugeOptions', merge({}, config, configUpdates));
  }
}

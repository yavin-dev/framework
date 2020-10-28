import Controller from '@ember/controller';
import { set, action } from '@ember/object';
import { merge } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import { GoalGaugeConfig } from 'navi-core/models/goal-gauge';
import { ModelFrom } from 'navi-core/utils/type-utils';
import GoalGaugeRoute from '../routes/goal-gauge';

export default class GoalGaugeController extends Controller {
  model!: ModelFrom<GoalGaugeRoute>;

  @tracked goalGaugeOptions: GoalGaugeConfig['metadata'] = {
    metricCid: this.model.firstObject!.request.metricColumns[0].cid,
    baselineValue: 2900000000,
    goalValue: 3100000000
  };

  get goalGaugeVisualization(): GoalGaugeConfig {
    return {
      type: 'goal-gauge',
      version: 2,
      metadata: this.goalGaugeOptions
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

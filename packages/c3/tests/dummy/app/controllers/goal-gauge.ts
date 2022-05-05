import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set, action } from '@ember/object';
import { merge } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import { GoalGaugeConfig } from '@yavin/c3/models/goal-gauge';
import { ModelFrom } from 'navi-core/utils/type-utils';
import GoalGaugeRoute from '../routes/goal-gauge';
import type YavinVisualizationsService from 'navi-core/services/visualization';

export default class GoalGaugeController extends Controller {
  declare model: ModelFrom<GoalGaugeRoute>;

  @service declare visualization: YavinVisualizationsService;

  get manifest() {
    return this.visualization.getVisualization('c3:goal-gauge');
  }

  @tracked goalGaugeOptions: GoalGaugeConfig['metadata'] = {
    metricCid: this.model.firstObject!.request.metricColumns[0].cid,
    baselineValue: 2900000000,
    goalValue: 3100000000,
  };

  get goalGaugeVisualization(): GoalGaugeConfig {
    return {
      type: 'goal-gauge',
      version: 2,
      metadata: this.goalGaugeOptions,
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

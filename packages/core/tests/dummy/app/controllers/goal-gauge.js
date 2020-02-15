import Controller from '@ember/controller';
import { set, get, computed } from '@ember/object';
import { merge } from 'lodash-es';

export default Controller.extend({
  request: computed(() => ({})),

  response: computed('model', function() {
    return this.get('model.0.response.rows');
  }),

  goalGaugeOptions: computed(() => ({
    metric: { metric: 'DAU', parameters: {} },
    baselineValue: '2900000000',
    goalValue: '3100000000'
  })),

  goalGaugeVisualization: computed('goalGaugeOptions', function() {
    return {
      type: 'goal-gauge',
      version: 1,
      metadata: get(this, 'goalGaugeOptions')
    };
  }),

  actions: {
    /**
     * @action - onUpdateConfig merges config into the metricLabelOptions
     */
    onUpdateConfig(configUpdates) {
      let config = get(this, 'goalGaugeOptions');
      set(this, 'goalGaugeOptions', merge({}, config, configUpdates));
    }
  }
});

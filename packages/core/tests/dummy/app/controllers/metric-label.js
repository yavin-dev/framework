import Controller from '@ember/controller';
import { set, get, computed } from '@ember/object';
import merge from 'lodash/merge';

export default Controller.extend({
  request: computed(() => ({})),

  response: computed('model', function() {
    return this.get('model.0.response.rows');
  }),

  metricLabelOptions: computed(() => ({
    description: "Glass Bottles of the ranch's finest pasteurized whole milk!!!!!!!",
    metric: { metric: 'bottles', parameters: {} },
    format: '$0,0[.]00'
  })),

  metricVisualization: computed('metricLabelOptions', function() {
    return {
      type: 'metric-label',
      version: 1,
      metadata: get(this, 'metricLabelOptions')
    };
  }),

  actions: {
    /**
     * @action - onUpdateConfig merges config into the metricLabelOptions
     */
    onUpdateConfig(configUpdates) {
      let config = get(this, 'metricLabelOptions');
      set(this, 'metricLabelOptions', merge({}, config, configUpdates));
    }
  }
});

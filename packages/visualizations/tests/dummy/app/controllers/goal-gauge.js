import Ember from 'ember';

const { get, set} = Ember;
export default Ember.Controller.extend({
  request: {},

  response: Ember.computed('model', function() {
    return this.get('model.0.response.rows');
  }),

  goalGaugeOptions: {
    metric: 'DAU',
    baselineValue: '2900000000',
    goalValue: '3100000000'
  },

  goalGaugeVisualization: Ember.computed('goalGaugeOptions', function() {
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
      let config = get(this,'goalGaugeOptions');
      set(this, 'goalGaugeOptions',
        Ember.$.extend(true, {}, config, configUpdates)
      );
    }
  }
});

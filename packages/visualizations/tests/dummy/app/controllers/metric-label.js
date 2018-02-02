import Ember from 'ember';

const { get, set } = Ember;
export default Ember.Controller.extend({
  request: {},

  response: Ember.computed('model', function() {
    return this.get('model.0.response.rows');
  }),

  metricLabelOptions: {
    description: 'Glass Bottles of the ranch\'s finest pasteurized whole milk!!!!!!!',
    metric: 'bottles',
    format: '$0,0[.]00'
  },

  metricVisualization: Ember.computed('metricLabelOptions', function() {
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
      let config = get(this,'metricLabelOptions');
      set(this, 'metricLabelOptions',
        Ember.$.extend(true, {}, config, configUpdates)
      );
    }
  }
});

import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.A([
      {
        response: { rows: [ { DAU: 3060000000 } ] },
        request: { metrics: [{metric: 'DAU', parameters: {}}]}
      }
    ]);
  }
});

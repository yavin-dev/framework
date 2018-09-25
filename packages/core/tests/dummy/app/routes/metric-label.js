import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.A([
      {
        response: {
          rows: [
            {
              bottles: 1000000,
              hp: 12,
              magic: 14,
              rupees: 3600100,
              arrows: 9999999999
            }
          ]
        }
      }
    ]);
  }
});

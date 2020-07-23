import Ember from 'ember';

export default Ember.Component.extend({
  sortProps: [],
  sortedContent: Ember.computed.sort('content', 'sortProps'),

  actions: {
    sort(direction, key) {
      this.set('sortProps', [key + ':' + direction]);
    }
  }
});

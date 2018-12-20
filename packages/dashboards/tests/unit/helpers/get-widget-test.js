import { test, moduleFor } from 'ember-qunit';
import Ember from 'ember';

moduleFor('helper:get-widget', 'Unit | Helper | get widget', {
  needs: [
    'model:dashboard-widget',
    'transform:moment',
    'serializer:dashboard-widget',
    'adapter:dashboard-widget',
    'validator:belongs-to',
    'validator:presence'
  ]
});

test('getWidget', function(assert) {
  assert.expect(2);

  let store = this.container.lookup('service:store'),
    getWidget = this.subject();

  Ember.run(() => {
    store.push({ data: { id: 2, type: 'dashboard-widget' } });
  });

  assert.equal(getWidget.compute([2]).get('id'), '2', 'widget with given id is returned');

  assert.equal(getWidget.compute([24]), null, 'undefined is returned when no widget has that id');
});

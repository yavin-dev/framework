import { moduleFor, test } from 'ember-qunit';

moduleFor('route:directory', 'Unit | Route | directory', {
  unit: true,
  needs: [ 'service:user' ]
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});

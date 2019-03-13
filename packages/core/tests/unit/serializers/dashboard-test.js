import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Serializer;

module('Unit | Serializer | dashboard', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:dashboard');
  });

  test('_addLinks', function(assert) {
    assert.expect(2);

    let dashboard = {
        id: 1,
        type: 'dashboards',
        relationships: {
          widgets: {
            data: 'abc'
          }
        }
      },
      serializedRecord = Serializer._addLinks(dashboard, 'widgets');

    assert.notOk(serializedRecord.relationships.widgets.data, 'The relationship data is removed from the payload');

    assert.deepEqual(
      serializedRecord.relationships.widgets.links,
      { related: '/dashboards/1/widgets' },
      'The relationship data is replaced with a link property'
    );
  });
});

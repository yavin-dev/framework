import { moduleForModel, test } from 'ember-qunit';

let Serializer;

moduleForModel('dashboard', 'Unit | Serializer | dashboard', {
  // Specify the other units that are required for this test.
  needs: ['serializer:dashboard', 'model:dashboard-widget'],
  beforeEach() {
    Serializer = this.container.lookup('serializer:dashboard');
  }
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

  assert.notOk(
    serializedRecord.relationships.widgets.data,
    'The relationship data is removed from the payload'
  );

  assert.deepEqual(
    serializedRecord.relationships.widgets.links,
    { related: '/dashboards/1/widgets' },
    'The relationship data is replaced with a link property'
  );
});

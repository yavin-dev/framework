import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let Serializer, DashboardClass, MetadataService;

module('Unit | Serializer | dashboard', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:dashboard');
    DashboardClass = this.owner.lookup('service:store').modelFor('dashboard');
    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
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

  test('normalize', function(assert) {
    assert.expect(2);

    let dashboard = {
        id: '2',
        type: 'dashboard',
        attributes: {
          filters: null,
          presentation: {
            version: 1,
            layout: []
          },
          title: 'Unfiltered'
        },
        relationships: {}
      },
      serializedRecord = Serializer.normalize(DashboardClass, dashboard),
      expectedRecord = Object.assign({}, { data: dashboard });

    expectedRecord.data.attributes.filters = [];

    assert.deepEqual(serializedRecord, expectedRecord, 'Null on filters property is set to empty array');

    let dashboard2 = {
        id: '3',
        type: 'dashboard',
        attributes: {
          filters: [
            {
              dimension: 'os',
              operator: 'notin',
              field: 'id',
              rawValues: ['a', 'b']
            }
          ],
          presentation: {
            version: 1,
            layout: []
          },
          title: 'Filtered'
        },
        relationships: {}
      },
      serializedRecord2 = Serializer.normalize(DashboardClass, dashboard2),
      expectedRecord2 = {
        data: {
          id: '3',
          type: 'dashboard',
          attributes: {
            filters: [
              {
                dimension: MetadataService.getById('dimension', 'os'),
                operator: 'notin',
                field: 'id',
                rawValues: ['a', 'b']
              }
            ],
            presentation: {
              version: 1,
              layout: []
            },
            title: 'Filtered'
          },
          relationships: {}
        }
      };

    assert.deepEqual(
      serializedRecord2,
      expectedRecord2,
      'No changes are made when filters is something other than null'
    );
  });

  test('serialize', async function(assert) {
    await MetadataService.loadMetadata({ dataSourceName: 'blockhead' });
    const dashboard = await this.owner.lookup('service:store').findRecord('dashboard', 6);
    const serialized = dashboard.serialize();

    assert.equal(serialized.data.attributes.title, 'Multi Source Dashboard', 'Title got serialized correctly');
    assert.deepEqual(
      serialized.data.attributes.filters[0],
      { dimension: 'dummy.age', operator: 'in', field: 'id', values: [1, 2, 3] },
      'Dummy filter serializes correctly with datasource'
    );
    assert.deepEqual(
      serialized.data.attributes.filters[1],
      { dimension: 'blockhead.container', operator: 'notin', field: 'id', values: [1] },
      'Blockhead filter serializes correctly with datasource'
    );
  });
});

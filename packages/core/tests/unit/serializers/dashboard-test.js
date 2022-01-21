import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { set } from '@ember/object';

let Serializer, DashboardClass, MetadataService;

module('Unit | Serializer | dashboard', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Serializer = this.owner.lookup('serializer:dashboard');
    DashboardClass = this.owner.lookup('service:store').modelFor('dashboard');
    MetadataService = this.owner.lookup('service:navi-metadata');
    await MetadataService.loadMetadata();
  });

  test('_addLinks', function (assert) {
    assert.expect(2);

    let dashboard = {
        id: 1,
        type: 'dashboards',
        relationships: {
          widgets: {
            data: 'abc',
          },
        },
      },
      serializedRecord = Serializer._addLinks(dashboard, 'widgets');

    assert.notOk(serializedRecord.relationships.widgets.data, 'The relationship data is removed from the payload');

    assert.deepEqual(
      serializedRecord.relationships.widgets.links,
      { related: '/dashboards/1/widgets' },
      'The relationship data is replaced with a link property'
    );
  });

  test('normalize', function (assert) {
    assert.expect(3);

    const dashboard = {
        id: '1',
        type: 'dashboard',
        attributes: {
          filters: null,
          presentation: {
            version: 1,
            layout: [],
          },
          title: 'Unfiltered',
        },
        relationships: {},
      },
      serializedRecord = Serializer.normalize(DashboardClass, dashboard),
      expectedRecord = Object.assign({}, { data: dashboard });

    expectedRecord.data.attributes.filters = [];

    assert.deepEqual(serializedRecord, expectedRecord, 'Null on filters property is set to empty array');

    const dashboard2 = {
        id: '2',
        type: 'dashboard',
        attributes: {
          filters: [
            {
              type: 'timeDimension',
              dimension: 'bardOne.network.dateTime',
              operator: 'bet',
              field: 'day',
              values: ['P1D', 'current'],
            },
            {
              dimension: 'os',
              operator: 'notin',
              field: 'id',
              values: ['a', 'b'],
            },
            {
              dimension: 'bardOne.property',
              operator: 'contains',
              field: 'id',
              values: ['114', '100001'],
            },
          ],
          presentation: {
            version: 1,
            layout: [],
          },
          title: 'Filtered',
        },
        relationships: {},
      },
      serializedRecord2 = Serializer.normalize(DashboardClass, dashboard2),
      expectedRecord2 = {
        data: {
          id: '2',
          type: 'dashboard',
          attributes: {
            filters: [
              {
                type: 'timeDimension',
                field: 'network.dateTime',
                parameters: { grain: 'day' },
                operator: 'bet',
                values: ['P1D', 'current'],
                source: 'bardOne',
              },
              {
                type: 'dimension',
                field: 'os',
                parameters: {
                  field: 'id',
                },
                operator: 'notin',
                values: ['a', 'b'],
                source: 'bardOne',
              },
              {
                type: 'dimension',
                field: 'property',
                parameters: {
                  field: 'id',
                },
                operator: 'contains',
                values: ['114', '100001'],
                source: 'bardOne',
              },
            ],
            presentation: {
              version: 1,
              layout: [],
            },
            title: 'Filtered',
          },
          relationships: {},
        },
      };

    assert.deepEqual(serializedRecord2, expectedRecord2, 'Dashboard with filters is normalized correctly');

    const dashboard3 = {
        id: '3',
        type: 'dashboard',
        attributes: {
          filters: [
            {
              type: 'timeDimension',
              dimension: 'elide.namespace.table.dateTime',
              operator: 'bet',
              field: 'day',
              values: ['P1D', 'current'],
            },
            {
              dimension: 'elide.namespace.table.os',
              operator: 'notin',
              field: 'id',
              values: ['a', 'b'],
            },
          ],
          presentation: {
            version: 1,
            layout: [],
          },
          title: 'Filtered',
        },
        relationships: {},
      },
      serializedRecord3 = Serializer.normalize(DashboardClass, dashboard3),
      expectedRecord3 = {
        data: {
          id: '3',
          type: 'dashboard',
          attributes: {
            filters: [
              {
                type: 'timeDimension',
                field: 'table.dateTime',
                parameters: { grain: 'day' },
                operator: 'bet',
                values: ['P1D', 'current'],
                source: 'elide.namespace',
              },
              {
                type: 'dimension',
                field: 'table.os',
                parameters: {
                  field: 'id',
                },
                operator: 'notin',
                values: ['a', 'b'],
                source: 'elide.namespace',
              },
            ],
            presentation: {
              version: 1,
              layout: [],
            },
            title: 'Filtered',
          },
          relationships: {},
        },
      };

    assert.deepEqual(serializedRecord3, expectedRecord3, 'Dashboard of source with namespace is normalized correctly');
  });

  test('serialize', async function (assert) {
    await MetadataService.loadMetadata({ dataSourceName: 'bardTwo' });
    const dashboard = await this.owner.lookup('service:store').findRecord('dashboard', 6);
    const serialized = dashboard.serialize();

    assert.equal(serialized.data.attributes.title, 'Multi Source Dashboard', 'Title got serialized correctly');
    assert.deepEqual(
      serialized.data.attributes.filters[0],
      {
        type: 'timeDimension',
        dimension: 'bardOne.network.dateTime',
        operator: 'bet',
        field: 'day',
        values: ['P7D', 'current'],
      },
      'bardOne timeDimension filter serializes correctly with datasource'
    );
    assert.deepEqual(
      serialized.data.attributes.filters[1],
      { type: 'dimension', dimension: 'bardOne.age', operator: 'in', field: 'id', values: [1, 2, 3] },
      'bardOne dimension filter serializes correctly with datasource'
    );
    assert.deepEqual(
      serialized.data.attributes.filters[2],
      { type: 'dimension', dimension: 'bardTwo.container', operator: 'notin', field: 'id', values: [1] },
      'bardTwo filter serializes correctly with datasource'
    );

    // Test serializing a filter with no parameters
    set(dashboard.filters.objectAt(1), 'parameters', {});
    const serialized2 = dashboard.serialize();
    assert.deepEqual(
      serialized2.data.attributes.filters[1],
      { type: 'dimension', dimension: 'bardOne.age', operator: 'in', field: undefined, values: [1, 2, 3] },
      'bardOne filter serializes correctly with datasource'
    );
  });
});

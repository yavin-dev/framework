import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';

let mockModel;

module('Unit | Model | Fragment | BardRequest  - Request', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const Store = this.owner.lookup('service:store');
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    run(() => {
      Store.pushPayload({
        data: [
          {
            id: 1,
            type: 'fragments-v2-mock',
            attributes: {
              request: {
                filters: [
                  {
                    field: 'network.dateTime',
                    operator: 'bet',
                    type: 'timeDimension',
                    parameters: { grain: 'day' },
                    values: ['P1D', 'current']
                  },
                  {
                    field: 'uniqueIdentifier',
                    type: 'metric',
                    operator: 'gt',
                    values: [3]
                  }
                ],
                columns: [
                  {
                    cid: '1111111111',
                    field: 'network.dateTime',
                    parameters: { grain: 'day' },
                    type: 'timeDimension',
                    alias: 'time'
                  },
                  {
                    cid: '2222222222',
                    field: 'property',
                    parameters: { field: 'id' },
                    type: 'dimension'
                  },
                  {
                    cid: '3333333333',
                    field: 'revenue',
                    parameters: { currency: 'USD' },
                    type: 'metric'
                  },
                  {
                    cid: '4444444444',
                    field: 'navClicks',
                    type: 'metric'
                  }
                ],
                sorts: [
                  {
                    field: 'dateTime',
                    type: 'timeDimension',
                    direction: 'asc'
                  },
                  {
                    field: 'navClicks',
                    type: 'metric',
                    direction: 'desc'
                  }
                ],
                table: 'network',
                dataSource: 'bardOne',
                limit: 2
              }
            }
          }
        ]
      });

      mockModel = Store.peekRecord('fragments-v2-mock', 1);
    });
  });

  test('Model using the Request Fragment', async function(assert) {
    assert.ok(mockModel, 'mockModel is fetched from the store');

    const { request } = mockModel;

    assert.equal(request.table, 'network', 'the `table` property has the correct value');

    assert.equal(request.limit, 2, 'the `limit` property has the correct value');

    assert.equal(request.requestVersion, '2.0', 'the `requestVersion` property has the correct default value');

    assert.equal(request.dataSource, 'bardOne', 'the `dataSource` property has the correct value');

    assert.equal(request.columns.objectAt(1).cid, '2222222222', '`cid` attribute is loaded into the column fragment');

    assert.equal(
      request.columns.objectAt(1).columnMetadata.category,
      'Asset',
      'meta data is populated on sub fragments'
    );
    assert.equal(
      request.columns.objectAt(2).columnMetadata.category,
      'Revenue',
      'meta data is populated on sub fragments'
    );
    assert.equal(
      request.filters.objectAt(1).columnMetadata.category,
      'Identifiers',
      'Filters also have meta data populated'
    );

    assert.equal(request.sorts.objectAt(1).columnMetadata.category, 'Clicks', 'Sorts have meta data populated');
  });

  test('time-dimension matches table metadata', async function(assert) {
    const { request } = mockModel;
    let timeDimension = request.columns.objectAt(0).columnMetadata;
    assert.ok(
      timeDimension instanceof TimeDimensionMetadataModel,
      'dateTime time-dimension uses actual metadata model'
    );

    assert.deepEqual(
      timeDimension.supportedGrains.map(g => g.grain),
      ['Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year', 'All'],
      'meta data is populated on sub fragments'
    );

    request.columns.objectAt(0).field = 'tableB.dateTime';
    timeDimension = request.columns.objectAt(0).columnMetadata;

    assert.deepEqual(
      timeDimension.supportedGrains.map(g => g.grain),
      ['Day', 'Week', 'Month', 'Quarter', 'Year', 'All'],
      'meta data is populated on sub fragments'
    );

    assert.deepEqual(timeDimension.timeZone, 'UTC', 'meta data is populated on sub fragments');
  });

  test('Clone Request', async function(assert) {
    const request = mockModel.request.clone();

    assert.equal(request.table, 'network', 'the `table` property of the cloned request has the correct value');

    assert.equal(request.limit, 2, 'the `limit` property of the cloned request has the correct value');

    assert.equal(
      request.requestVersion,
      '2.0',
      'the `requestVersion` property of the cloned request has the correct value'
    );

    assert.equal(
      request.dataSource,
      'bardOne',
      'the `dataSource` property of the cloned request has the correct value'
    );

    // filters

    assert.equal(
      request.filters.objectAt(0).field,
      'network.dateTime',
      'the `field` property of the first filter has the correct value'
    );

    assert.equal(
      request.filters.objectAt(1).operator,
      'gt',
      'the `operator` property of the second filter has the correct value'
    );

    assert.deepEqual(
      request.filters.objectAt(1).values,
      [3],
      'the `values` property of the second filter has the correct value'
    );

    assert.equal(
      request.filters.objectAt(1).columnMetadata.category,
      'Identifiers',
      'the meta data attached is correct'
    );

    // columns

    assert.equal(
      request.columns.objectAt(0).cid,
      '1111111111',
      'the `cid` property of the first column has the correct value'
    );

    assert.equal(
      request.columns.objectAt(0).field,
      'network.dateTime',
      'the `field` property of the first column has the correct value'
    );

    assert.deepEqual(
      request.columns.objectAt(0).parameters,
      { grain: 'day' },
      'the `parameters` property of the first column has the correct value'
    );

    assert.equal(
      request.columns.objectAt(0).alias,
      'time',
      'the `alias` property of the first column has the correct value'
    );

    assert.equal(
      request.columns.objectAt(1).type,
      'dimension',
      'the `type` property of the second column has the correct value'
    );

    assert.equal(request.columns.objectAt(1).columnMetadata.category, 'Asset', 'the meta data attached is correct');

    // sort

    assert.equal(
      request.sorts.objectAt(0).field,
      'dateTime',
      'the `field` property of the first sort has the correct value'
    );

    assert.equal(
      request.sorts.objectAt(1).direction,
      'desc',
      'the `direction` property of the second sort has the correct value'
    );

    assert.equal(request.sorts.objectAt(1).columnMetadata.category, 'Clicks', 'the meta data attached is correct');
  });

  test('Validation', async function(assert) {
    const { request } = mockModel;

    assert.ok(request.validations.isValid, 'request is valid');
    assert.equal(request.validations.messages.length, 0, 'there are no validation errors for a valid request');

    request.set('table', '');
    assert.notOk(request.validations.isValid, 'a request with an empty `table` is invalid');
    assert.deepEqual(
      request.validations.messages,
      ['Table is invalid or unavailable'],
      'error messages collection is correct for a request with an empty `table'
    );

    request.set('table', 'network');
    request.set('filters', null);
    assert.notOk(request.validations.isValid, 'a request without a `filters` collection is invalid');
    assert.deepEqual(
      request.validations.messages,
      ['Filters must be a collection'],
      'error messages collection is correct for a request without a `filters` collection'
    );

    request.set('filters', []);
    request.set('columns', null);
    assert.notOk(request.validations.isValid, 'a request without a `columns` collection is invalid');
    assert.deepEqual(
      request.validations.messages,
      ['Columns must be a collection'],
      'error messages collection is correct for a request without a `columns` collection'
    );

    request.set('columns', []);
    assert.notOk(request.validations.isValid, 'a request with an empty `columns` collection is invalid');
    assert.deepEqual(
      request.validations.messages,
      ['At least one column should be selected'],
      'error messages collection is correct for a request with an empty `columns` collection'
    );

    request.set('sorts', null);
    assert.notOk(request.validations.isValid, 'a request without a `sorts` collection is invalid');
    assert.equal(
      request.validations.messages.objectAt(1),
      'Sorts must be a collection',
      'error messages collection is correct for a request without a `sorts` collection'
    );
  });

  test('Validation - filters has-many', async function(assert) {
    const { request } = mockModel;

    request.set('filters', [
      {
        field: 'dateTime',
        operator: 'bet',
        type: 'timeDimension',
        values: ['P1D', 'current']
      },
      {
        field: null,
        operator: null,
        type: null,
        values: null
      }
    ]);
    assert.notOk(request.validations.isValid, 'a request with an invalid filter is invalid');
    assert.equal(request.validations.messages.length, 3, 'there are 3 error messages for the invalid filter');
    assert.ok(
      request.validations.messages.includes('The `field` field cannot be empty'),
      'error messages include one for the `field` filter field'
    );
  });

  test('Validation - columns has-many', async function(assert) {
    const { request } = mockModel;

    request.set('columns', [
      {
        field: 'dateTime',
        parameters: { grain: 'day' },
        type: 'timeDimension',
        alias: 'time'
      },
      {
        field: null
      }
    ]);
    assert.notOk(request.validations.isValid, 'a request with an invalid column is invalid');
    assert.deepEqual(
      request.validations.messages,
      ['The `field` field cannot be empty'],
      'error messages collection is correct for a request with an invalid column'
    );
  });

  test('Validation - sorts has-many', async function(assert) {
    const { request } = mockModel;

    request.set('sorts', [
      {
        field: 'dateTime',
        type: 'timeDimension',
        direction: 'asc'
      },
      {
        field: null,
        direction: null
      }
    ]);
    assert.notOk(request.validations.isValid, 'a request with an invalid sort is invalid');
    assert.equal(request.validations.messages.length, 2, 'there are 2 error messages for the invalid sort');
    assert.ok(
      request.validations.messages.includes('The `field` field cannot be empty'),
      'error messages include one for the `field` sort field'
    );
  });

  test('Serialization', async function(assert) {
    assert.deepEqual(
      mockModel.serialize().data.attributes.request,
      {
        filters: [
          {
            field: 'network.dateTime',
            type: 'timeDimension',
            parameters: { grain: 'day' },
            operator: 'bet',
            values: ['P1D', 'current']
          },
          {
            field: 'uniqueIdentifier',
            type: 'metric',
            parameters: {},
            operator: 'gt',
            values: [3]
          }
        ],
        columns: [
          {
            cid: '1111111111',
            field: 'network.dateTime',
            parameters: { grain: 'day' },
            type: 'timeDimension',
            alias: 'time'
          },
          {
            cid: '2222222222',
            alias: null,
            field: 'property',
            parameters: { field: 'id' },
            type: 'dimension'
          },
          {
            cid: '3333333333',
            alias: null,
            field: 'revenue',
            parameters: { currency: 'USD' },
            type: 'metric'
          },
          {
            cid: '4444444444',
            alias: null,
            field: 'navClicks',
            parameters: {},
            type: 'metric'
          }
        ],
        sorts: [
          {
            field: 'dateTime',
            type: 'timeDimension',
            parameters: {},
            direction: 'asc'
          },
          {
            field: 'navClicks',
            type: 'metric',
            parameters: {},
            direction: 'desc'
          }
        ],
        table: 'network',
        dataSource: 'bardOne',
        limit: 2,
        requestVersion: '2.0'
      },
      'The request model attribute was serialized correctly'
    );
  });

  test('nonTimeDimensions', function(assert) {
    const { request } = mockModel;
    assert.deepEqual(
      request.nonTimeDimensions,
      request.columns.filter(c => c.type === 'dimension'),
      'nonTimeDimensions returns expected dimension columns ignoring the timeDimension and metric columns'
    );

    request.addColumn({
      type: 'dimension',
      source: request.dataSource,
      field: 'foo',
      parameters: {}
    });

    assert.deepEqual(
      request.nonTimeDimensions,
      request.columns.filter(c => c.type === 'dimension'),
      'nonTimeDimensions recomputes when the request columns change'
    );
  });
});

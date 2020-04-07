import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

let mockModel;

module('Unit | Model | Fragment | BardRequest V2 - Request', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    mockModel = run(() =>
      this.owner.lookup('service:store').createRecord('fragments-v2-mock', {
        request: {
          filters: [
            {
              field: 'dateTime',
              operator: 'bet',
              values: ['P1D', 'current']
            },
            {
              field: 'uniqueIdentifier',
              operator: 'gt',
              values: [3]
            }
          ],
          columns: [
            {
              field: 'dateTime',
              parameters: { grain: 'day' },
              type: 'dimension',
              alias: 'time'
            },
            {
              field: 'property',
              type: 'dimension'
            },
            {
              field: 'revenue',
              parameters: { currency: 'USD' },
              type: 'metric'
            },
            {
              field: 'navClicks',
              type: 'metric'
            }
          ],
          sort: [
            {
              field: 'dateTime',
              direction: 'asc'
            },
            {
              field: 'navClicks',
              direction: 'desc'
            }
          ],
          table: 'network',
          dataSource: 'dummy',
          limit: 2
        }
      })
    );
  });

  test('Model using the Request Fragment', async function(assert) {
    assert.expect(6);

    assert.ok(mockModel, 'mockModel is fetched from the store');

    const { request } = mockModel;

    assert.equal(request.table, 'network', 'the `table` property has the correct value');

    assert.equal(request.limit, 2, 'the `limit` property has the correct value');

    assert.equal(request.requestVersion, '2.0', 'the `requestVersion` property has the correct default value');

    assert.equal(request.dataSource, 'dummy', 'the `dataSource` property has the correct value');

    assert.equal(request.responseFormat, 'json', 'the `responseFormat` property has the correct default value');
  });

  test('Clone Request', async function(assert) {
    assert.expect(14);

    const request = mockModel.request.clone();

    assert.equal(request.table, 'network', 'the `table` property of the cloned request has the correct value');

    assert.equal(request.limit, 2, 'the `limit` property of the cloned request has the correct value');

    assert.equal(
      request.requestVersion,
      '2.0',
      'the `requestVersion` property of the cloned request has the correct value'
    );

    assert.equal(request.dataSource, 'dummy', 'the `dataSource` property of the cloned request has the correct value');

    assert.equal(
      request.responseFormat,
      'json',
      'the `responseFormat` property of the cloned request has the correct value'
    );

    // filters

    assert.equal(
      request.filters.objectAt(0).field,
      'dateTime',
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

    // columns

    assert.equal(
      request.columns.objectAt(0).field,
      'dateTime',
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

    // sort

    assert.equal(
      request.sort.objectAt(0).field,
      'dateTime',
      'the `field` property of the first sort has the correct value'
    );

    assert.equal(
      request.sort.objectAt(1).direction,
      'desc',
      'the `direction` property of the second sort has the correct value'
    );
  });

  test('Validation', async function(assert) {
    assert.expect(14);

    const { request } = mockModel;

    assert.ok(request.validations.isValid, 'request is valid');
    assert.equal(request.validations.messages.length, 0, 'there are no validation errors for a valid request');

    request.set('responseFormat', '');
    assert.notOk(request.validations.isValid, 'a request with an empty `responseFormat` is invalid');
    assert.deepEqual(
      request.validations.messages,
      ['Response format cannot be empty'],
      'error messages collection is correct for a request with an empty `responseFormat'
    );

    request.set('responseFormat', 'json');
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

    request.set('sort', null);
    assert.notOk(request.validations.isValid, 'a request without a `sort` collection is invalid');
    assert.equal(
      request.validations.messages.objectAt(1),
      'Sort must be a collection',
      'error messages collection is correct for a request without a `sort` collection'
    );
  });

  test('Validation - filters has-many', async function(assert) {
    assert.expect(3);

    const { request } = mockModel;

    //TODO: use addFilter()
    request.set('filters', [
      {
        field: 'dateTime',
        operator: 'bet',
        values: ['P1D', 'current']
      },
      {
        field: null,
        operator: null,
        values: []
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
    assert.expect(2);

    const { request } = mockModel;

    //TODO: use addColumn()
    request.set('columns', [
      {
        field: 'dateTime',
        parameters: { grain: 'day' },
        type: 'dimension',
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

  test('Validation - sort has-many', async function(assert) {
    assert.expect(3);

    const { request } = mockModel;

    //TODO: use addSort()
    request.set('sort', [
      {
        field: 'dateTime',
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
    assert.expect(1);

    assert.deepEqual(
      mockModel.serialize().data.attributes.request,
      {
        filters: [
          {
            field: 'dateTime',
            operator: 'bet',
            values: ['P1D', 'current']
          },
          {
            field: 'uniqueIdentifier',
            operator: 'gt',
            values: [3]
          }
        ],
        columns: [
          {
            field: 'dateTime',
            parameters: { grain: 'day' },
            type: 'dimension',
            alias: 'time'
          },
          {
            field: 'property',
            type: 'dimension',
            alias: null
          },
          {
            field: 'revenue',
            parameters: { currency: 'USD' },
            type: 'metric',
            alias: null
          },
          {
            field: 'navClicks',
            type: 'metric',
            alias: null
          }
        ],
        sort: [
          {
            field: 'dateTime',
            direction: 'asc'
          },
          {
            field: 'navClicks',
            direction: 'desc'
          }
        ],
        table: 'network',
        dataSource: 'dummy',
        limit: 2,
        requestVersion: '2.0'
      },
      'The request model attribute was serialized correctly'
    );
  });
});

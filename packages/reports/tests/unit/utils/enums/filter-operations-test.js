import FilterOperations from 'navi-reports/utils/enums/filter-operations';
import { module, test } from 'qunit';

module('Unit | Utils | Enums - Filter Operations', function() {
  test('all', function(assert) {
    assert.expect(1);

    let allFilterOperations = FilterOperations.all(),
      expectedOperations = [
        {
          id: 'in',
          name: 'Equals',
          valuesComponent: 'filter-form/select-input'
        },
        {
          id: 'notin',
          name: 'Not Equals',
          valuesComponent: 'filter-form/select-input'
        },
        {
          id: 'null',
          name: 'Is Empty',
          valuesComponent: 'filter-form/null-input'
        },
        {
          id: 'notnull',
          name: 'Is Not Empty',
          valuesComponent: 'filter-form/null-input'
        },
        {
          id: 'contains',
          name: 'Contains',
          valuesComponent: 'filter-form/text-input'
        }
      ];

    assert.deepEqual(allFilterOperations, expectedOperations, 'all returns the expected array of response formats');
  });

  test('getById', function(assert) {
    assert.expect(7);

    /* == Valid cases == */
    let allFilterOperations = FilterOperations.all(),
      responseFormat = FilterOperations.getById('in');

    assert.equal(responseFormat, allFilterOperations[0], 'getById returned expected object with id in');

    responseFormat = FilterOperations.getById('notin');
    assert.equal(responseFormat, allFilterOperations[1], 'getById returned expected object with id notin');

    responseFormat = FilterOperations.getById('foo');
    assert.equal(
      responseFormat,
      undefined,
      'getById returned undefined when object is not present in enum with id foo'
    );

    /* == Invalid cases == */
    assert.throws(
      function() {
        FilterOperations.getById();
      },
      /^Error.*id: `undefined` should be of type string and non-empty$/,
      'getById throws error when no id is passed'
    );

    assert.throws(
      function() {
        FilterOperations.getById(null);
      },
      /^Error.*id: `null` should be of type string and non-empty$/,
      'getById throws error when null id is passed'
    );

    assert.throws(
      function() {
        FilterOperations.getById(23);
      },
      /^Error.*id: `23` should be of type string and non-empty$/,
      'getById throws error when non string object passed as id'
    );

    assert.throws(
      function() {
        FilterOperations.getById('');
      },
      /^Error.*id: `` should be of type string and non-empty$/,
      'getById throws error when non string object passed as id'
    );
  });
});

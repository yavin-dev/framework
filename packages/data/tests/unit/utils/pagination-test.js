import PaginationUtils from 'navi-data/utils/pagination';
import { module, test } from 'qunit';

module('Unit - Utils - Pagination Utils', function () {
  test('getPaginatedRecords', function (assert) {
    assert.expect(9);

    let records = ['a', 'b', 'c', 'd', 'e', 'f'];

    assert.deepEqual(
      PaginationUtils.getPaginatedRecords(records, 2, 3),
      ['e', 'f'],
      'getPaginatedRecords returns content on page 3 as expected'
    );

    assert.deepEqual(
      PaginationUtils.getPaginatedRecords(records, 4, 2),
      ['e', 'f'],
      'getPaginatedRecords returns number of records less than the limit on the last page as expected'
    );

    assert.deepEqual(
      PaginationUtils.getPaginatedRecords([], 4, 2),
      [],
      'getPaginatedRecords returns no content when all records is an empty array'
    );

    assert.deepEqual(
      PaginationUtils.getPaginatedRecords(records),
      records,
      'getPaginatedRecords returns all records when page number and limit are not specified'
    );

    assert.deepEqual(
      PaginationUtils.getPaginatedRecords(records, 3),
      ['a', 'b', 'c'],
      'getPaginatedRecords returns contents on first page when limit is specified but not page'
    );

    assert.throws(
      function () {
        PaginationUtils.getPaginatedRecords();
      },
      /allRecords param must be defined/,
      'getPaginatedRecords throws error when allRecords param is not defined'
    );

    assert.throws(
      function () {
        PaginationUtils.getPaginatedRecords(records, '2');
      },
      /Limit must be of type number/,
      'getPaginatedRecords throws error when limit param is invalid'
    );

    assert.throws(
      function () {
        PaginationUtils.getPaginatedRecords(records, 2, '3');
      },
      /Invalid page\/limit specified/,
      'getPaginatedRecords throws error when page param is invalid'
    );

    assert.throws(
      function () {
        PaginationUtils.getPaginatedRecords(records, undefined, 2);
      },
      /Invalid page\/limit specified/,
      'getPaginatedRecords throws error when limit is invalid and page valid'
    );
  });
});

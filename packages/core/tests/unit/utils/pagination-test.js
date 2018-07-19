import { getPaginatedRecords } from 'navi-core/utils/pagination';
import { module, test } from 'qunit';

module('Unit | Utils | Pagination Utils');

test('getPaginatedRecords', function(assert) {
  assert.expect(9);

  let records = ['a', 'b', 'c', 'd', 'e', 'f'];

  assert.deepEqual(
    getPaginatedRecords(records, 2, 3),
    ['e', 'f'],
    'getPaginatedRecords returns content on page 3 as expected'
  );

  assert.deepEqual(
    getPaginatedRecords(records, 4, 2),
    ['e', 'f'],
    'getPaginatedRecords returns number of records less than the limit on the last page as expected'
  );

  assert.deepEqual(
    getPaginatedRecords([], 4, 2),
    [],
    'getPaginatedRecords returns no content when all records is an empty array'
  );

  assert.deepEqual(
    getPaginatedRecords(records),
    records,
    'getPaginatedRecords returns all records when page number and limit are not specified'
  );

  assert.deepEqual(
    getPaginatedRecords(records, 3),
    ['a', 'b', 'c'],
    'getPaginatedRecords returns contents on first page when limit is specified but not page'
  );

  assert.throws(
    () => getPaginatedRecords(),
    /allRecords param must be defined/,
    'getPaginatedRecords throws error when allRecords param is not defined'
  );

  assert.throws(
    () => getPaginatedRecords(records, '2'),
    /Limit must be of type number/,
    'getPaginatedRecords throws error when limit param is invalid'
  );

  assert.throws(
    () => getPaginatedRecords(records, 2, '3'),
    /Invalid page\/limit specified/,
    'getPaginatedRecords throws error when page param is invalid'
  );

  assert.throws(
    () => getPaginatedRecords(records, undefined, 2),
    /Invalid page\/limit specified/,
    'getPaginatedRecords throws error when limit is invalid and page valid'
  );
});

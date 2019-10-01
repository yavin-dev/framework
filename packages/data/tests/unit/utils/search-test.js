import EmberObject from '@ember/object';
import { A } from '@ember/array';
import SearchUtils from 'navi-data/utils/search';
import { module, test } from 'qunit';

module('Unit - Utils - Search Utils', function() {
  test('getPartialMatchWeight', function(assert) {
    assert.expect(4);

    assert.equal(
      SearchUtils.getPartialMatchWeight('heavy green character', 'kart weight'),
      undefined,
      'No match weight when query does not match'
    );

    assert.equal(
      SearchUtils.getPartialMatchWeight('heavy green character', 'heavy yellow character'),
      undefined,
      'No match weight when not all words are found'
    );

    assert.equal(
      SearchUtils.getPartialMatchWeight('heavy green character', 'character heavy'),
      7,
      'Match is found despite word order'
    );

    const weight1 = SearchUtils.getPartialMatchWeight('heavy green character', 'character'),
      weight2 = SearchUtils.getPartialMatchWeight('heavy green character', 'heavy character');

    assert.ok(weight1 > weight2, 'Closer match has smaller match weight');
  });

  test('getExactMatchWeight', function(assert) {
    assert.expect(3);

    assert.equal(
      SearchUtils.getExactMatchWeight('158', 'karts'),
      undefined,
      'No match weight when query does not match'
    );

    assert.equal(SearchUtils.getExactMatchWeight('15897', '158'), 3, 'Match is found when string contains query');

    const weight1 = SearchUtils.getExactMatchWeight('15897', '158'),
      weight2 = SearchUtils.getExactMatchWeight('158', '158');

    assert.ok(weight1 > weight2, 'Closer match has smaller match weight');
  });

  test('searchDimensionRecords', function(assert) {
    assert.expect(8);

    const records = A([
      EmberObject.create({
        id: 'bike',
        description: 'All Bikes'
      }),
      EmberObject.create({
        id: '123456',
        description: 'Sport Bike'
      }),
      EmberObject.create({
        id: '1234567',
        description: 'Bowser'
      }),
      EmberObject.create({
        id: '123',
        description: 'Standard Kart'
      })
    ]);

    let results = A(SearchUtils.searchDimensionRecords(records, 'Bike', 100));

    assert.equal(results[0].record.get('description'), 'All Bikes', 'First result is most relevant dimension');

    assert.equal(results[0].relevance, 1, 'When query matches id and description, smallest relevance value is used');

    assert.equal(results.length, 2, 'Correct number of matching results are returned');

    results = SearchUtils.searchDimensionRecords(records, '123', 2);
    assert.equal(results.length, 2, 'Search results are correctly limited');

    results = A(SearchUtils.searchDimensionRecords(records, '123', 2, 2));
    assert.deepEqual(
      results.mapBy('record'),
      [records[2]],
      'Pagination for search results returns records as expected'
    );

    results = SearchUtils.searchDimensionRecords(records, 'moible', 100);
    assert.equal(results.length, 0, 'No results are returned when query does not match any record');

    results = A(SearchUtils.searchDimensionRecords(records, '123', 100));

    assert.deepEqual(results.mapBy('record.id'), ['123', '123456', '1234567'], 'Results are sorted in relevance order');

    const expectedResults = [
      {
        record: records[3],
        relevance: 1
      },
      {
        record: records[1],
        relevance: 4
      },
      {
        record: records[2],
        relevance: 5
      }
    ];
    assert.deepEqual(results, expectedResults, 'Results contain expected records, order, and relevance');
  });

  test('searchDimensionRecords - without description', function(assert) {
    assert.expect(2);

    let records = A([
      {
        id: 'bike',
        description: 'All Bikes'
      },
      {
        id: '123456'
      },
      {
        id: '1234567'
      },
      {
        id: '123',
        description: 'Standard Kart'
      }
    ]);

    let results = A(SearchUtils.searchDimensionRecords(records, 'bike', 100));

    assert.deepEqual(
      results.mapBy('record'),
      [records[0]],
      'Pagination for search results returns records even when records do not have description fields'
    );

    results = A(SearchUtils.searchDimensionRecords(records, '123456', 100));

    assert.deepEqual(
      results.mapBy('record.id'),
      ['123456', '1234567'],
      'Pagination for search results returns records even when records do not have description fields'
    );
  });
});

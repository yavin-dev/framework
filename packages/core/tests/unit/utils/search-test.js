import {
  getPartialMatchWeight,
  getExactMatchWeight,
  searchRecords,
  searchDimensionRecords
} from 'navi-core/utils/search';
import { module, test } from 'qunit';

module('Unit | Utils | Search Utils');

test('getPartialMatchWeight', function(assert) {
  assert.expect(6);

  assert.equal(
    getPartialMatchWeight('heavy green character', 'kart weight'),
    undefined,
    'No match weight when query does not match'
  );

  assert.equal(
    getPartialMatchWeight('heavy green character', 'heavy yellow character'),
    undefined,
    'No match weight when not all words are found'
  );

  assert.equal(
    getPartialMatchWeight('heavy green character', 'character heavy'),
    7,
    'Match is found despite word order'
  );

  assert.equal(
    getPartialMatchWeight('great green character', 'great grea'),
    undefined,
    'Match not found when previous token is already accounted for'
  );

  assert.equal(
    getPartialMatchWeight('great green character', 'great gree'),
    12,
    'Match not found when previous token is already accounted for'
  );

  let weight1 = getPartialMatchWeight('heavy green character', 'character'),
    weight2 = getPartialMatchWeight('heavy green character', 'heavy character');
  assert.ok(weight1 > weight2, 'Closer match has smaller match weight');
});

test('getExactMatchWeight', function(assert) {
  assert.expect(3);

  assert.equal(getExactMatchWeight('158', 'karts'), undefined, 'No match weight when query does not match');
  assert.equal(getExactMatchWeight('15897', '158'), 3, 'Match is found when string includes query');

  let weight1 = getExactMatchWeight('15897', '158'),
    weight2 = getExactMatchWeight('158', '158');
  assert.ok(weight1 > weight2, 'Closer match has smaller match weight');
});

test('searchRecords', function(assert) {
  assert.expect(2);

  let records = [
    {
      id: 'bike',
      description: 'All Bikes'
    },
    {
      id: '123456',
      description: 'Sport Bike'
    },
    {
      id: '1234567',
      description: 'Bowser'
    },
    {
      id: '123',
      description: 'Standard Kart'
    }
  ];

  assert.deepEqual(
    searchRecords(records, 'Bike', 'description'),
    [
      {
        description: 'All Bikes',
        id: 'bike'
      },
      {
        description: 'Sport Bike',
        id: '123456'
      }
    ],
    'The matching records are returned and sorted by relevance of description'
  );

  assert.deepEqual(
    searchRecords(records, '123', 'id'),
    [
      {
        description: 'Standard Kart',
        id: '123'
      },
      {
        description: 'Sport Bike',
        id: '123456'
      },
      {
        description: 'Bowser',
        id: '1234567'
      }
    ],
    'The matching records are returned now sorted by relevance of ids'
  );
});

test('searchDimensionRecords', function(assert) {
  assert.expect(8);

  let records = [
    {
      id: 'bike',
      description: 'All Bikes'
    },
    {
      id: '123456',
      description: 'Sport Bike'
    },
    {
      id: '1234567',
      description: 'Bowser'
    },
    {
      id: '123',
      description: 'Standard Kart'
    }
  ];

  let results = searchDimensionRecords(records, 'Bike', 100);
  assert.equal(results[0].record.description, 'All Bikes', 'First result is most relevant dimension');

  assert.equal(results[0].relevance, 1, 'When query matches id and description, smallest relevance value is used');

  assert.equal(results.length, 2, 'Correct number of matching results are returned');

  results = searchDimensionRecords(records, '123', 2);
  assert.equal(results.length, 2, 'Search results are correctly limited');

  results = searchDimensionRecords(records, '123', 2, 2);
  assert.deepEqual(results.mapBy('record'), [records[2]], 'Pagination for search results returns records as expected');

  results = searchDimensionRecords(records, 'moible', 100);
  assert.equal(results.length, 0, 'No results are returned when query does not match any record');

  results = searchDimensionRecords(records, '123', 100);
  assert.deepEqual(results.mapBy('record.id'), ['123', '123456', '1234567'], 'Results are sorted in relevance order');

  let expectedResults = [
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

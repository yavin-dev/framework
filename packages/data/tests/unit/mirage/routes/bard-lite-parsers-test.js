import { module, test } from 'qunit';
import { parseFilters } from 'navi-data/mirage/routes/bard-lite-parsers';

module('Unit | Mirage | Routes | Bard Lite Parsers', function() {
  test('parseFilters - empty', function(assert) {
    assert.expect(2);

    assert.deepEqual(parseFilters(''), [], 'empty string parses to empty array');

    assert.deepEqual(parseFilters(), [], 'undefined parses to empty array');
  });

  test('parseFilters - simple', function(assert) {
    assert.expect(4);

    assert.deepEqual(
      parseFilters('dim|id-in[value]'),
      [{ dimension: 'dim', field: 'id', operator: 'in', values: ['value'] }],
      'parses filter with one unquoted value'
    );

    assert.deepEqual(
      parseFilters('dim|id-contains["value"]'),
      [{ dimension: 'dim', field: 'id', operator: 'contains', values: ['value'] }],
      'parses filter with one quoted value'
    );

    assert.deepEqual(
      parseFilters('dim|key-in["value, 2"]'),
      [{ dimension: 'dim', field: 'key', operator: 'in', values: ['value, 2'] }],
      'parses filter with quotes value containing comma and space'
    );

    assert.deepEqual(
      parseFilters('dimension|id-in["o""k"]'),
      [{ dimension: 'dimension', field: 'id', operator: 'in', values: ['o"k'] }],
      'parses filter with escaped quotation mark'
    );
  });

  test('parseFilters - multiple values', function(assert) {
    assert.expect(3);

    assert.deepEqual(
      parseFilters('dim|id-in[value,value 2]'),
      [{ dimension: 'dim', field: 'id', operator: 'in', values: ['value', 'value 2'] }],
      'parses filter with 2 values unquoted'
    );

    assert.deepEqual(
      parseFilters('dim|id-in[value,"value 2"]'),
      [{ dimension: 'dim', field: 'id', operator: 'in', values: ['value', 'value 2'] }],
      'parses filter with one unquoted and one quoted'
    );

    assert.deepEqual(
      parseFilters('dim|id-in[value,"o "", nice "]'),
      [{ dimension: 'dim', field: 'id', operator: 'in', values: ['value', 'o ", nice '] }],
      'parses filter with one unquoted one weird quoted'
    );
  });

  test('parseFilters - multiple dimensions', function(assert) {
    assert.expect(2);

    assert.deepEqual(
      parseFilters('dim|id-in[value,value 2],dim2|id-in[this]'),
      [
        { dimension: 'dim', field: 'id', operator: 'in', values: ['value', 'value 2'] },
        { dimension: 'dim2', field: 'id', operator: 'in', values: ['this'] }
      ],
      'parses multiple filters with different structures'
    );

    assert.deepEqual(
      parseFilters('dim|id-in[value,value 2],dim2|key-contains["the values","like",these]'),
      [
        { dimension: 'dim', field: 'id', operator: 'in', values: ['value', 'value 2'] },
        { dimension: 'dim2', field: 'key', operator: 'contains', values: ['the values', 'like', 'these'] }
      ],
      'parses multiple filters with different value formats'
    );
  });
});

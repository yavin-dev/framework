import { module, test } from 'qunit';
import { parseFilters, parseHavings, parseMetrics } from 'navi-data/mirage/routes/bard-lite-parsers';

module('Unit | Mirage | Routes | Bard Lite Parsers', function() {
  module('parseFilters', function() {
    test('empty', function(assert) {
      assert.expect(2);

      assert.deepEqual(parseFilters(''), [], 'empty string parses to empty array');
      assert.deepEqual(parseFilters(), [], 'undefined parses to empty array');
    });

    test('simple', function(assert) {
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

    test('multiple values', function(assert) {
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

    test('multiple dimensions', function(assert) {
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

  module('parseHavings', function() {
    test('empty', function(assert) {
      assert.expect(2);

      assert.deepEqual(parseHavings(''), {}, 'empty string parses to empty object');
      assert.deepEqual(parseHavings(), {}, 'undefined parses to empty object');
    });

    test('simple', function(assert) {
      assert.expect(2);

      assert.deepEqual(
        parseHavings('metric-gt[1]'),
        { metric: { operator: 'gt', values: ['1'] } },
        'parses a single having'
      );

      assert.deepEqual(
        parseHavings('metric-bet[0,100]'),
        { metric: { operator: 'bet', values: ['0', '100'] } },
        'parses a single having with multiple values'
      );
    });

    test('multiple', function(assert) {
      assert.expect(1);

      assert.deepEqual(
        parseHavings('metric-bet[0,100],metric2-nbet[100,0]'),
        {
          metric: { operator: 'bet', values: ['0', '100'] },
          metric2: { operator: 'nbet', values: ['100', '0'] }
        },
        'parses multiple havings with multiple params'
      );
    });
  });

  module('parseMetrics', function() {
    test('empty', function(assert) {
      assert.expect(2);

      assert.deepEqual(parseMetrics(''), [], 'empty string parses to empty array');
      assert.deepEqual(parseMetrics(), [], 'undefined parses to empty array');
    });

    test('simple', function(assert) {
      assert.expect(2);

      assert.deepEqual(parseMetrics('metric1'), ['metric1'], 'parses filter with one unquoted value');

      assert.deepEqual(parseMetrics('metric1,metric2'), ['metric1', 'metric2'], 'parses multiple metrics');
    });

    test('parameterized', function(assert) {
      assert.expect(5);
      assert.deepEqual(parseMetrics('params(a=b,c=4)'), ['params(a=b,c=4)'], 'parses parameterized metric');

      assert.deepEqual(parseMetrics('params(,(),((,)))'), ['params(,(),((,)))'], 'parses nested parens and commas');

      assert.deepEqual(
        parseMetrics('params(a=b,c=4),other(d=f)'),
        ['params(a=b,c=4)', 'other(d=f)'],
        'parses multiple parameterized metrics'
      );

      assert.deepEqual(
        parseMetrics('params(a=b,c=4),none()'),
        ['params(a=b,c=4)', 'none()'],
        'parses empty parameterized metric'
      );

      assert.deepEqual(
        parseMetrics('metric1,params(a=b,c=(d,2,3)),metric2'),
        ['metric1', 'params(a=b,c=(d,2,3))', 'metric2'],
        'parses nested parameterized metrics'
      );
    });
  });
});

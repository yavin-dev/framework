import { moduleFor, test } from 'ember-qunit';
import { metricFormat } from 'navi-data/helpers/metric-format';

moduleFor('helper:metric-format', 'Unit | Helper | metric formatter');

test('It formats metrics appropriately', function(assert) {
  assert.expect(6);
  assert.equal(
    metricFormat({ metric: 'revenue' }, 'Revenue'),
    'Revenue',
    'Formats metrics given longname'
  );
  assert.equal(
    metricFormat(null, 'bar'),
    'bar',
    'Returns long name in case metric is not available'
  );
  assert.equal(
    metricFormat({ metric: 'foo' }),
    '--',
    'Renders -- if longname is not given'
  );
  assert.equal(
    metricFormat(
      { metric: { name: 'foo', longName: 'Foo' }, parameters: { p: 1 } },
      'Bar'
    ),
    'Bar (1)',
    'Formats metric with parameters'
  );
  assert.equal(
    metricFormat(
      {
        metric: { name: 'foo', longName: 'Foo' },
        parameters: { p: 1, m: 3, as: 'ham' }
      },
      'Bar'
    ),
    'Bar (1,3)',
    'Formats multiple params and ignores the `as` parameter'
  );
  assert.equal(
    metricFormat({
      metric: { name: 'foo', longName: 'Foo' },
      parameters: { p: 1, m: 3, as: 'ham' }
    }),
    '-- (1,3)',
    'Formats multiple params and ignores the `as` parameter when default longname is allowed'
  );
});

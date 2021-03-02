import { module, test } from 'qunit';
import {
  getSelectedMetricsOfBase,
  getFilteredMetricsOfBase,
  getUnfilteredMetricsOfBase,
} from 'navi-reports/utils/request-metric';
import { A as arr } from '@ember/array';

const EmptyRequest = { columns: [], filters: [] };

const foo1 = {
  type: 'metric',
  field: 'foo',
  parameters: {
    thing: '1',
  },
  canonicalName: 'foo(thing=1)',
  columnMetadata: { id: 'foo' },
};
const foo2 = {
  type: 'metric',
  field: 'foo',
  parameters: {
    thing: '2',
  },
  canonicalName: 'foo(thing=2)',
  columnMetadata: { id: 'foo' },
};
const bar = {
  type: 'metric',
  field: 'bar',
  parameters: {},
  canonicalName: 'bar',
  columnMetadata: { id: 'bar' },
};
module('Unit | Utils | request metric', function () {
  test('getSelectedMetricsOfBase', function (assert) {
    assert.expect(2);

    const request = { columns: [foo1, foo2, bar], filters: [] };

    assert.deepEqual(
      arr(getSelectedMetricsOfBase({ id: 'foo' }, request)).mapBy('canonicalName'),
      ['foo(thing=1)', 'foo(thing=2)'],
      'getSelectedMetricsOfBase returns all the metrics in request with the baseMetric type `foo`'
    );

    assert.deepEqual(
      getSelectedMetricsOfBase({ id: 'foo' }, EmptyRequest),
      [],
      'getSelectedMetricsOfBase returns an empty array when no metrics in the request match'
    );
  });

  test('getFilteredMetricsOfBase', function (assert) {
    assert.expect(2);

    const request = { columns: [], filters: [foo1, foo2, bar] };

    assert.deepEqual(
      arr(getFilteredMetricsOfBase({ id: 'foo' }, request)).mapBy('canonicalName'),
      ['foo(thing=1)', 'foo(thing=2)'],
      'getFilteredMetricsOfBase returns all the havings in request with the baseMetric type `foo`'
    );

    assert.deepEqual(
      getFilteredMetricsOfBase({ id: 'foo' }, EmptyRequest),
      [],
      'getFilteredMetricsOfBase returns an empty array when no having in the request match'
    );
  });

  test('getUnfilteredMetricsOfBase', function (assert) {
    assert.expect(2);

    const request = { columns: [foo1, foo2, bar], filters: [foo1] };

    assert.deepEqual(
      arr(getUnfilteredMetricsOfBase({ id: 'foo' }, request)).mapBy('canonicalName'),
      ['foo(thing=2)'],
      'getUnfilteredMetricsOfBase returns all the metrics in request that are not filtered with baseMetric type `foo`'
    );

    assert.deepEqual(
      getUnfilteredMetricsOfBase({ id: 'foo' }, EmptyRequest),
      [],
      'getSelectedMetricsOfBase returns an empty array when no having in the request match'
    );
  });
});

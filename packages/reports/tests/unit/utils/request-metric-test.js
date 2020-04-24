import { module, test } from 'qunit';
import {
  getSelectedMetricsOfBase,
  getFilteredMetricsOfBase,
  getUnfilteredMetricsOfBase
} from 'navi-reports/utils/request-metric';
import { A as arr } from '@ember/array';

module('Unit | Utils | request metric', function() {
  test('getSelectedMetricsOfBase', function(assert) {
    assert.expect(2);

    let request = {
      metrics: [
        {
          metric: { id: 'foo' },
          canonicalName: 'foo-metric1'
        },
        {
          metric: { id: 'foo' },
          canonicalName: 'foo-metric2'
        },
        {
          metric: { id: 'bar' },
          canonicalName: 'bar-metric2'
        }
      ]
    };

    assert.deepEqual(
      arr(getSelectedMetricsOfBase({ id: 'foo' }, request)).mapBy('canonicalName'),
      ['foo-metric1', 'foo-metric2'],
      'getSelectedMetricsOfBase returns all the metrics in request with the baseMetric type `foo`'
    );

    assert.deepEqual(
      getSelectedMetricsOfBase({ id: 'foo' }, { metrics: [] }),
      [],
      'getSelectedMetricsOfBase returns an empty array when no metrics in the request match'
    );
  });

  test('getFilteredMetricsOfBase', function(assert) {
    assert.expect(2);

    let request = {
      having: [
        {
          metric: {
            metric: { id: 'foo' },
            canonicalName: 'foo-metric1'
          }
        },
        {
          metric: {
            metric: { id: 'foo' },
            canonicalName: 'foo-metric2'
          }
        },
        {
          metric: {
            metric: { id: 'bar' },
            canonicalName: 'bar-metric2'
          }
        }
      ]
    };

    assert.deepEqual(
      arr(getFilteredMetricsOfBase({ id: 'foo' }, request)).mapBy('metric.canonicalName'),
      ['foo-metric1', 'foo-metric2'],
      'getFilteredMetricsOfBase returns all the havings in request with the baseMetric type `foo`'
    );

    assert.deepEqual(
      getFilteredMetricsOfBase({ id: 'foo' }, { having: [] }),
      [],
      'getFilteredMetricsOfBase returns an empty array when no having in the request match'
    );
  });

  test('getUnfilteredMetricsOfBase', function(assert) {
    assert.expect(2);

    let request = {
      metrics: [
        {
          metric: { id: 'foo' },
          canonicalName: 'foo-metric1'
        },
        {
          metric: { id: 'foo' },
          canonicalName: 'foo-metric2'
        },
        {
          metric: { id: 'bar' },
          canonicalName: 'bar-metric2'
        }
      ],
      having: [
        {
          metric: {
            metric: { id: 'foo' },
            canonicalName: 'foo-metric1'
          }
        }
      ]
    };

    assert.deepEqual(
      arr(getUnfilteredMetricsOfBase({ id: 'foo' }, request)).mapBy('canonicalName'),
      ['foo-metric2'],
      'getUnfilteredMetricsOfBase returns all the metrics in request that are not filtered with baseMetric type `foo`'
    );

    assert.deepEqual(
      getUnfilteredMetricsOfBase({ id: 'foo' }, { having: [] }),
      [],
      'getSelectedMetricsOfBase returns an empty array when no having in the request match'
    );
  });
});

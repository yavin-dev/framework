import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import PieChartManifest from 'navi-core/navi-visualization-manifests/pie-chart';
import { buildTestRequest } from '../../helpers/request';

let Manifest: PieChartManifest;

module('Unit | Manifests | pie chart', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    Manifest = this.owner.lookup('navi-visualization-manifest:pie-chart');
  });

  test('valid for single time bucket and group by', function (assert) {
    const request = buildTestRequest(
      [{ field: 'adClicks' }],
      [{ field: 'age', parameters: { field: 'id' } }],
      { start: 'current', end: 'next' },
      'day'
    );
    assert.ok(
      Manifest.typeIsValid(request),
      'pie chart type is valid for single time bucket with dimension and metric'
    );
  });

  test('invalid for multiple time buckets', function (assert) {
    const request = buildTestRequest(
      [{ field: 'adClicks' }],
      [{ field: 'age', parameters: { field: 'id' } }],
      { start: '2015-11-09 00:00:00.000', end: '2015-11-16 00:00:00.000' },
      'day'
    );
    assert.notOk(Manifest.typeIsValid(request), 'pie chart type is invalid for multiple time buckets');
  });

  test('invalid for single time bucket with no group by', function (assert) {
    const request = buildTestRequest([{ field: 'adClicks' }], [], { start: 'current', end: 'next' }, 'day');
    assert.notOk(Manifest.typeIsValid(request), 'pie chart type is invalid for single time bucket with no group by');
  });

  test('valid for single time bucket with no group by and multiple metrics', function (assert) {
    const request = buildTestRequest(
      [{ field: 'adClicks' }, { field: 'totalPageViews' }],
      [],
      { start: 'current', end: 'next' },
      'day'
    );
    assert.ok(
      Manifest.typeIsValid(request),
      'pie chart type is valid for single time bucket with no group by and multiple metrics'
    );
  });

  test('invalid for single time bucket with no metrics', function (assert) {
    const request = buildTestRequest(
      [],
      [{ field: 'age', parameters: { field: 'id' } }],
      { start: 'current', end: 'next' },
      'day'
    );
    assert.notOk(Manifest.typeIsValid(request), 'pie chart type is invalid for single time bucket with no metrics');
  });
});

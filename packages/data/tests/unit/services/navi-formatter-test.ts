import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import NaviFormatterService from 'navi-data/services/navi-formatter';
import { TestContext } from 'ember-test-helpers';
import Metric from 'navi-data/models/metadata/metric';

let Service: NaviFormatterService;
const metric = { name: 'Revenue' } as Metric;
const emptyMetric = {} as Metric;

module('Unit | Service | navi formatter', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    Service = this.owner.lookup('service:navi-formatter');
  });

  test('no parameters', async function (assert) {
    assert.expect(3);

    assert.equal(Service.formatColumnName(metric), 'Revenue', 'Prints name');
    assert.equal(Service.formatColumnName(metric, undefined, 'override'), 'override', 'Prints alias instead of name');
    assert.equal(
      Service.formatColumnName(emptyMetric, undefined, 'override'),
      'override',
      'Prints alias even with no name'
    );
  });

  test('parameters', async function (assert) {
    assert.expect(3);

    assert.equal(Service.formatColumnName(metric, {}), 'Revenue', 'Prints name and hides empty parameters');
    assert.equal(
      Service.formatColumnName(metric, { realParam: 'realValue' }),
      'Revenue (realValue)',
      'Prints name with single parameter'
    );
    assert.equal(
      Service.formatColumnName(metric, { realParam1: 'realValue1', realParam2: 'realValue2' }),
      'Revenue (realValue1,realValue2)',
      'Prints name with multiple parameters'
    );
  });

  test('parameters with alias', async function (assert) {
    assert.equal(Service.formatColumnName(metric, {}, 'override'), 'override', 'Prints alias and instead of name');
    assert.equal(Service.formatColumnName(metric, { realParam: 'realValue' }, 'override'), 'override', 'Prints alias');

    assert.equal(
      Service.formatColumnName(metric, { realParam1: 'realValue1', realParam2: 'realValue2' }, 'override'),
      'override',
      'Prints alias and instead of name with parameters'
    );
  });

  test('empty metric', async function (assert) {
    assert.expect(3);

    assert.equal(Service.formatColumnName({ id: 'foo' } as Metric), '--', 'Prints "--" if name is not given');
    assert.equal(Service.formatColumnName(emptyMetric), '--', 'Prints "--" if metric is empty');
    assert.equal(Service.formatColumnName(undefined), '--', 'Prints "--" if metric is undefined');
  });
});

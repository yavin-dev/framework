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

module('Unit | Service | navi formatter', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    Service = this.owner.lookup('service:navi-formatter');
  });

  test('no parameters', async function(assert) {
    assert.expect(3);

    assert.equal(Service.formatMetric(metric), 'Revenue', 'Prints name');
    assert.equal(Service.formatMetric(metric, undefined, 'override'), 'override', 'Prints alias instead of name');
    assert.equal(
      Service.formatMetric(emptyMetric, undefined, 'override'),
      'override',
      'Prints alias even with no name'
    );
  });

  test('parameters', async function(assert) {
    assert.expect(5);

    assert.equal(Service.formatMetric(metric, {}), 'Revenue', 'Prints name and hides empty parameters');
    assert.equal(Service.formatMetric(metric, { as: 'lame' }), 'Revenue', 'Prints name and hides the "as" parameter');
    assert.equal(
      Service.formatMetric(metric, { realParam: 'realValue' }),
      'Revenue (realValue)',
      'Prints name with real parameter'
    );
    assert.equal(
      Service.formatMetric(metric, { as: 'lame', realParam: 'realValue' }),
      'Revenue (realValue)',
      'Prints name with real parameter and hides "as"'
    );
    assert.equal(
      Service.formatMetric(metric, { as: 'lame', realParam1: 'realValue1', realParam2: 'realValue2' }),
      'Revenue (realValue1,realValue2)',
      'Prints name with multiple real parameters and hides "as"'
    );
  });

  test('parameters with alias', async function(assert) {
    assert.expect(5);

    assert.equal(Service.formatMetric(metric, {}, 'override'), 'override', 'Prints alias and hides empty parameters');
    assert.equal(
      Service.formatMetric(metric, { as: 'lame' }, 'override'),
      'override',
      'Prints alias and hides the "as" parameter'
    );
    assert.equal(
      Service.formatMetric(metric, { realParam: 'realValue' }, 'override'),
      'override (realValue)',
      'Prints alias with real parameter'
    );
    assert.equal(
      Service.formatMetric(metric, { as: 'lame', realParam: 'realValue' }, 'override'),
      'override (realValue)',
      'Prints alias with real parameter and hides "as"'
    );
    assert.equal(
      Service.formatMetric(metric, { as: 'lame', realParam1: 'realValue1', realParam2: 'realValue2' }, 'override'),
      'override (realValue1,realValue2)',
      'Prints alias with multiple real parameters and hides "as"'
    );
  });

  test('empty metric', async function(assert) {
    assert.expect(3);

    assert.equal(Service.formatMetric({ id: 'foo' } as Metric), '--', 'Prints "--" if name is not given');
    assert.equal(Service.formatMetric(emptyMetric), '--', 'Prints "--" if metric is empty');
    assert.equal(Service.formatMetric(undefined), '--', 'Prints "--" if metric is undefined');
  });
});

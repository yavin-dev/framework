import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-ignore
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import NaviFormatterService from 'navi-data/services/navi-formatter';
import { TestContext } from 'ember-test-helpers';

let Service: NaviFormatterService;

module('Unit | Service | navi formatter', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    await this.owner.lookup('service:bard-metadata').loadMetadata();
    Service = this.owner.lookup('service:navi-formatter');
  });

  test('formatMetric', async function(assert) {
    assert.expect(6);

    assert.equal(Service.formatMetric({ metric: 'revenue' }, 'Revenue'), 'Revenue', 'Formats metrics given longname');
    assert.equal(Service.formatMetric(null, 'bar'), 'bar', 'Returns long name in case metric is not available');
    assert.equal(Service.formatMetric({ metric: 'foo' }), '--', 'Renders -- if longname is not given');
    assert.equal(
      Service.formatMetric({ metric: { name: 'foo', longName: 'Foo' }, parameters: { p: 1 } }, 'Bar'),
      'Bar (1)',
      'Formats metric with parameters'
    );
    assert.equal(
      Service.formatMetric(
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
      Service.formatMetric({
        metric: { name: 'foo', longName: 'Foo' },
        parameters: { p: 1, m: 3, as: 'ham' }
      }),
      '-- (1,3)',
      'Formats multiple params and ignores the `as` parameter when default longname is allowed'
    );
  });
});

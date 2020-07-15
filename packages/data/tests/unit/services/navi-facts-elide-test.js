import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TestRequest = {
  logicalTable: {
    table: 'table1',
    timeGrain: 'grain1'
  },
  metrics: [{ metric: 'm1' }, { metric: 'm2' }],
  dimensions: [{ dimension: 'd1' }, { dimension: 'd2' }],
  filters: [
    { dimension: 'd3', operator: 'in', values: ['v1', 'v2'] },
    {
      dimension: 'd4',
      operator: 'in',
      values: ['v3', 'v4']
    }
  ],
  having: [
    {
      metric: 'm1',
      operator: 'gt',
      value: 0 // TODO switch to `values: [0]` after `value` backwards compatibility has been removed
    }
  ],
  intervals: [
    {
      start: '2015-01-03',
      end: '2015-01-04'
    }
  ]
};

module('Unit | Service | Navi Facts - Elide', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.service = this.owner.lookup('service:navi-facts');
  });

  test('fetch', async function(assert) {
    assert.expect(3);

    const response = await this.service.fetch(TestRequest);
    assert.ok(response);
  });

  // test('fetch and catch error', function(assert) {
  //   assert.expect(2);

  //   // Return an error
  //   return Service.fetch(TestRequest).catch(response => {
  //     assert.ok(true, 'A request error falls into the promise catch block');

  //     assert.equal(
  //       response.payload.reason,
  //       'Result set too large.  Try reducing interval or dimensions.',
  //       'error is passed to catch block'
  //     );
  //   });
  // });
});

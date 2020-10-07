import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import StoreService from '@ember-data/store';
import RequestMetricExists from 'navi-core/validators/request-metric-exist';

module('Unit | Validator | request-metric-exist', function(hooks) {
  setupTest(hooks);

  test('validate request-metric-exist', function(this: TestContext, assert) {
    assert.expect(2);

    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('bard-request-v2/request', {
      table: 'tableName',
      columns: [
        { type: 'metric', field: 'm1', cid: 'cid_m1' },
        { type: 'metric', field: 'm2', cid: 'cid_m2' }
      ],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });

    const validator = this.owner.lookup('validator:request-metric-exist') as RequestMetricExists;

    assert.equal(
      validator.validate('cid_m1', { request }),
      true,
      'request-metric-exist returns `true` when metric exists in request'
    );

    assert.equal(
      validator.validate('cid_m3', { request }),
      false,
      'request-metric-exist returns `false` when metric does not exists in request'
    );
  });
});

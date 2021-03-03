import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildTestRequest } from '../../helpers/request';
import StoreService from '@ember-data/store';
import { TestContext } from 'ember-test-helpers';

let Store: StoreService;
module('Unit | Model | Metric Label Visualization Fragment', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    Store = this.owner.lookup('service:store') as StoreService;
  });

  test('isValidForRequest', function (assert) {
    let request = buildTestRequest([{ cid: 'cid_rupees', field: 'rupees' }]);
    const metricLabel = Store.createRecord('all-the-fragments').metricLabel;

    set(metricLabel, 'metadata', { format: '0a', metricCid: 'cid_rupees' });
    assert.ok(
      metricLabel.isValidForRequest(request),
      'config for metric label is valid when metric in config exists in request'
    );

    request = buildTestRequest([{ field: 'swords' }, { field: 'hp' }]);
    assert.notOk(metricLabel.isValidForRequest(request), 'config for metric label is invalid when metrics are changed');
  });

  test('rebuildConfig', function (assert) {
    let metricLabel = Store.createRecord('all-the-fragments').metricLabel;

    const request = buildTestRequest([
      { cid: 'cid_rupees', field: 'rupees' },
      { cid: 'cid_hp', field: 'hp' },
    ]);
    const config = metricLabel.rebuildConfig(request, { rows: [{ rupees: 999, hp: 0 }], meta: {} }).toJSON();

    assert.deepEqual(
      config,
      {
        metadata: {
          format: '0,0.00',
          metricCid: 'cid_rupees',
        },
        type: 'metric-label',
        version: 2,
      },
      'config regenerated with metric updated'
    );
  });

  test('rebuildConfig - no columns', function (assert) {
    const metricLabel = Store.createRecord('all-the-fragments').metricLabel;
    const request = buildTestRequest([]);
    const config = metricLabel.rebuildConfig(request, { rows: [{ rupees: 999, hp: 0 }], meta: {} }).toJSON();

    assert.deepEqual(
      config,
      {
        metadata: {
          format: '0,0.00',
          metricCid: undefined,
        },
        type: 'metric-label',
        version: 2,
      },
      'config can be generated when no columns are present'
    );
  });
});

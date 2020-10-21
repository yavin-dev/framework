import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildTestRequest } from '../../helpers/request';
import { setOwner } from '@ember/application';

let helper;
module('Unit | Helper | default config', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    helper = this.owner.lookup('helper:default-config');
    helper = helper.create();
    setOwner(helper, this.owner);
  });

  test('default config', function(assert) {
    assert.expect(1);

    const rows = [{ rupees: 999, hp: 0 }];
    const request = buildTestRequest([
      { cid: 'cid_rupees', field: 'rupees' },
      { cid: 'cid_hp', field: 'hp' }
    ]);
    const generatedConfig = helper.compute(['metric-label', request, { rows }]);

    assert.deepEqual(
      generatedConfig,
      {
        metricCid: 'cid_rupees',
        format: '0,0.00'
      },
      'A config is generated for the given visualization, request, and response'
    );
  });

  test('bad visualization', function(assert) {
    assert.expect(1);

    const rows = [{ rupees: 999, hp: 0 }];
    const request = buildTestRequest([
      { cid: 'cid_rupees', field: 'rupees' },
      { cid: 'cid_hp', field: 'hp' }
    ]);

    assert.throws(
      () => helper.compute(['not-a-vis', request, { rows }]),
      /Default config can not be made since model:not-a-vis was not found/,
      'Giving an invalid visualization name throws an error'
    );
  });
});

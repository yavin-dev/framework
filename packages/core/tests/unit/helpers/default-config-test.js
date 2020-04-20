import { run } from '@ember/runloop';
import { buildTestRequest } from '../../helpers/request';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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

    let rows = [{ rupees: 999, hp: 0 }],
      request = buildTestRequest(
        [
          { metric: 'rupees', parameters: {} },
          { metric: 'hp', parameters: {} }
        ],
        []
      ),
      generatedConfig = run(() => helper.compute(['metric-label', request, { rows }]));

    assert.deepEqual(
      generatedConfig,
      {
        metric: {
          metric: 'rupees',
          parameters: {}
        },
        format: '0,0.00',
        description: 'Rupees'
      },
      'A config is generated for the given visualization, request, and response'
    );
  });

  test('bad visualization', function(assert) {
    assert.expect(1);

    let rows = [{ rupees: 999, hp: 0 }],
      request = buildTestRequest(['rupees', 'hp'], []);

    assert.throws(
      () => helper.compute(['not-a-vis', request, { rows }]),
      /Default config can not be made since model:not-a-vis was not found/,
      'Giving an invalid visualization name throws an error'
    );
  });
});

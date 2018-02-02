import { buildTestRequest } from '../../helpers/request';
import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

moduleFor('helper:default-config', 'Unit | Helper | default config', {
  needs: [
    'model:metric-label'
  ]
});

test('default config', function(assert) {
  assert.expect(1);

  let helper = this.subject(),
      rows = [
        { rupees: 999, hp: 0 }
      ],
      request = buildTestRequest(['rupees', 'hp'], []),
      generatedConfig = Ember.run(
        () => helper.compute(['metric-label', request, { rows }])
      );

  assert.deepEqual(generatedConfig,
    {
      metric: 'rupees',
      format: '0,0.00',
      description: 'Rupees'
    },
    'A config is generated for the given visualization, request, and response');
});

test('bad visualization', function(assert) {
  assert.expect(1);

  let helper = this.subject(),
      rows = [
        { rupees: 999, hp: 0 }
      ],
      request = buildTestRequest(['rupees', 'hp'], []);

  assert.throws(() => helper.compute(['not-a-vis', request, { rows }]),
    /Default config can not be made since model:not-a-vis was not found/,
    'Giving an invalid visualization name throws an error');
});

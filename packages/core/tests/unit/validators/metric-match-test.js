import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildModelTestRequest } from '../../helpers/request';

module('Unit | Validator | metric-match', function(hooks) {
  setupTest(hooks);

  test('metric-match validator correctly indicates discrepancies betwen request and config', function(assert) {
    assert.expect(3);

    const Validator = this.owner.lookup('validator:metric-match');
    const configMetrics = [
      {
        id: 'metric1',
        name: 'Metric1'
      },
      {
        id: 'metric2',
        name: 'Metric2'
      }
    ];

    let request = buildModelTestRequest(['metric1'], ['dimension1']);
    assert.notOk(
      Validator.validate(configMetrics, { request }),
      'metric-match returns false when any config metric is not in the request'
    );

    request = buildModelTestRequest(['metric1', 'metric2'], ['dimension1']);
    assert.ok(
      Validator.validate(configMetrics, { request }),
      'metric-match returns true when request metrics and config metrics match'
    );

    request = buildModelTestRequest(['metric1', 'metric2', 'metric3'], ['dimension1']);
    assert.notOk(
      Validator.validate(configMetrics, { request }),
      'metric-match returns false when any request metric is not in the config'
    );
  });
});

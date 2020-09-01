import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildModelTestRequest } from '../../helpers/request';

module('Unit | Validator | dimension-match', function(hooks) {
  setupTest(hooks);

  test('dimension-match validator correctly indicates discrepancies betwen request and config', function(assert) {
    assert.expect(3);

    const Validator = this.owner.lookup('validator:dimension-match');
    const configDimensions = [
      {
        id: 'dimension1',
        name: 'Dimension1'
      },
      {
        id: 'dimension2',
        name: 'Dimension2'
      }
    ];

    let request = buildModelTestRequest(['metric1'], ['dimension1']);
    assert.notOk(
      Validator.validate(configDimensions, { request }),
      'dimension-match returns false when any config dimension is not in the request'
    );

    request = buildModelTestRequest(['metric1'], ['dimension1', 'dimension2']);
    assert.ok(
      Validator.validate(configDimensions, { request }),
      'dimension-match returns true when request and config dimensions match'
    );

    request = buildModelTestRequest(['metric1'], ['dimension1', 'dimension2', 'dimension3']);
    assert.notOk(
      Validator.validate(configDimensions, { request }),
      'dimension-match returns false when any request dimension is not in the config'
    );
  });
});

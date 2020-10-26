/* eslint-disable @typescript-eslint/camelcase */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | dimension-series', function(hooks) {
  setupTest(hooks);

  test('validate dimension-series', function(assert) {
    assert.expect(2);

    let Validator = this.owner.lookup('validator:dimension-series'),
      request = this.owner.lookup('service:store').createFragment('bard-request-v2/request', {
        columns: [
          { field: 'd1', cid: 'cid_d1', type: 'dimension' },
          { field: 'd2', cid: 'cid_d2', type: 'dimension' }
        ]
      });

    assert.equal(
      Validator.validate(
        [
          {
            name: 'foo',
            values: {
              cid_d1: 'd1val1',
              cid_d2: 'd2val1'
            }
          },
          {
            name: 'bar',
            values: {
              cid_d1: 'd1val2',
              cid_d2: 'd2val2'
            }
          }
        ],
        { request }
      ),
      true,
      'dimension-series returns `true` when dimensions in the series match request dimensions'
    );

    assert.equal(
      Validator.validate(
        [
          {
            name: 'foo',
            values: {
              cid_d1: 'd1val1',
              cid_d3: 'd3val1'
            }
          },
          {
            name: 'bar',
            values: {
              cid_d1: 'd1val2',
              cid_d3: 'd3val2'
            }
          }
        ],
        { request }
      ),
      false,
      'dimension-series returns `false` when dimensions in the series do not match request dimensions'
    );
  });
});

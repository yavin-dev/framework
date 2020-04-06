import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { A as arr } from '@ember/array';

module('Unit | Validator | request-filters', function(hooks) {
  setupTest(hooks);

  test('validate request-filters', function(assert) {
    assert.expect(2);

    let Validator = this.owner.lookup('validator:request-filters'),
      request = {
        filters: arr([
          { dimension: { id: 'dim1' }, rawValues: ['d1'] },
          { dimension: { id: 'dim2' }, rawValues: ['d2'] }
        ])
      };

    let series = arr([
      {
        values: { dim1: 'd1' }
      },
      {
        values: { dim2: 'd2' }
      }
    ]);

    assert.equal(
      Validator.validate(series, { request }),
      true,
      'request-filters returns `true` when dimensions in series match filters in request'
    );

    series = arr([
      {
        values: { dim1: 'd1' }
      },
      {
        values: { dim1: 'd' }
      },
      {
        values: { dim2: 'd2' }
      }
    ]);

    assert.equal(
      Validator.validate(series, { request }),
      false,
      'request-filters returns `false` when dimensions in series are not in request filters'
    );
  });
});

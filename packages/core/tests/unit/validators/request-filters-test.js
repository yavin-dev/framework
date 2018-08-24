import { moduleFor, test } from 'ember-qunit';
import { A as arr } from '@ember/array';

moduleFor('validator:request-filters', 'Unit | Validator | request-filters', {
  needs: ['validator:messages']
});

test('validate request-filters', function(assert) {
  assert.expect(2);

  let Validator = this.subject(),
      request = {
        filters: arr([
          { dimension: { name: 'dim1' }, rawValues: ['d1'] },
          { dimension: { name: 'dim2' }, rawValues: ['d2'] }
        ])
      };

  let series = arr([{
    values: { dim1: 'd1' }
  },{
    values: { dim2: 'd2' }
  }]);

  assert.equal(Validator.validate(series, { request }),
    true,
    'request-filters returns `true` when dimensions in series match filters in request');

  series = arr([{
    values: { dim1: 'd1' }
  },{
    values: { dim1: 'd' }
  },{
    values: { dim2: 'd2' }
  }]);

  assert.equal(Validator.validate(series, { request }),
    false,
    'request-filters returns `false` when dimensions in series are not in request filters');
});

import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | request-metric-exist', function(hooks) {
  setupTest(hooks);

  test('validate request-metric-exist', function(assert) {
    assert.expect(2);

    let Validator = this.owner.lookup('validator:request-metric-exist'),
      request = {
        metrics: A([
          {
            metric: { id: 'm1' },
            canonicalName: 'm1',
            toJSON() {
              return { metric: this.metric, canonicalName: this.canonicalName };
            }
          },
          {
            metric: { id: 'm2' },
            canonicalName: 'm2',
            toJSON() {
              return { metric: this.metric, canonicalName: this.canonicalName };
            }
          }
        ])
      };

    assert.equal(
      Validator.validate({ metric: { id: 'm1' }, canonicalName: 'm1' }, { request }),
      true,
      'request-metric-exist returns `true` when metric exists in request'
    );

    assert.equal(
      Validator.validate({ metric: { id: 'm3' }, canonicalName: 'm3' }, { request }),
      false,
      'request-metric-exist returns `false` when metric does not exists in request'
    );
  });
});

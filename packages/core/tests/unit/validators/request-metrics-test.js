import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | request-metrics', function(hooks) {
  setupTest(hooks);

  test('validate request-metrics', function(assert) {
    assert.expect(2);

    let Validator = this.owner.lookup('validator:request-metrics'),
      request = {
        metrics: [
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
        ]
      };

    assert.equal(
      Validator.validate(
        [
          { metric: { id: 'm1' }, canonicalName: 'm1' },
          { metric: { id: 'm2' }, canonicalName: 'm2' }
        ],
        { request }
      ),
      true,
      'request-metrics returns `true` when series metrics is equal to request metrics'
    );

    assert.equal(
      Validator.validate(
        A([
          {
            metric: { id: 'm1' },
            canonicalName: 'm1',
            toJSON() {
              return { metric: this.metric, canonicalName: this.canonicalName };
            }
          }
        ]),
        { request }
      ),
      false,
      'request-metrics returns `false` when series metric is not equal to request metrics'
    );
  });
});

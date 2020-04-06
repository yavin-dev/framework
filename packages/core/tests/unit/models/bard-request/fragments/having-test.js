import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

let Store, MetadataService, RevenueMetric;

module('Unit | Model Fragment | BardRequest - Having', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');

    MetadataService = this.owner.lookup('service:bard-metadata');

    return MetadataService.loadMetadata().then(() => {
      RevenueMetric = MetadataService.getById('metric', 'revenue');

      //Add instances to the store
      run(() => {
        Store.pushPayload('fragments-mock', {
          data: {
            id: 1,
            type: 'fragments-mock',
            attributes: {
              having: [
                {
                  metric: {
                    metric: 'revenue',
                    parameters: { currency: 'USD' }
                  },
                  operator: 'gt',
                  values: [100]
                }
              ]
            }
          }
        });
      });
    });
  });

  test('Model using the Having Fragment', function(assert) {
    assert.expect(8);

    let mockModel = Store.peekRecord('fragments-mock', 1),
      pageViewMetric = MetadataService.getById('metric', 'pageViews');

    assert.ok(mockModel, 'mockModel is fetched from the store');

    run(() => {
      assert.deepEqual(
        mockModel
          .get('having')
          .objectAt(0)
          .get('metric.metric'),
        RevenueMetric,
        'The property metric is deserialized to the `Revenue` metric metadata object'
      );

      assert.deepEqual(
        mockModel
          .get('having')
          .objectAt(0)
          .get('metric.parameters'),
        { currency: 'USD' },
        'The property metric has the correct parameters object'
      );

      assert.equal(
        mockModel
          .get('having')
          .objectAt(0)
          .get('operator'),
        'gt',
        'The property operator has the value `gt`'
      );

      assert.deepEqual(
        mockModel
          .get('having')
          .objectAt(0)
          .get('values'),
        [100],
        'The property values has the value `100`'
      );

      /* == Setter Method == */
      mockModel
        .get('having')
        .objectAt(0)
        .set(
          'metric',
          Store.createFragment('bard-request/fragments/metric', {
            metric: pageViewMetric
          })
        );
      mockModel
        .get('having')
        .objectAt(0)
        .set('operator', 'gte');
      mockModel
        .get('having')
        .objectAt(0)
        .set('values', [350]);
    });

    assert.deepEqual(
      mockModel
        .get('having')
        .objectAt(0)
        .get('metric.metric'),
      pageViewMetric,
      'The property having has the metric with metadata for `Page Views` set using setter'
    );

    assert.equal(
      mockModel
        .get('having')
        .objectAt(0)
        .get('operator'),
      'gte',
      'The property having has the operator `gte` set using setter'
    );

    assert.deepEqual(
      mockModel
        .get('having')
        .objectAt(0)
        .get('values'),
      [350],
      'The property values has the value `[350]` set using setter'
    );
  });

  test('Computed values', async function(assert) {
    assert.expect(3);

    await settled();
    run(() => {
      let mockModel = Store.peekRecord('fragments-mock', 1);

      assert.deepEqual(
        mockModel
          .get('having')
          .objectAt(0)
          .get('values'),
        [100],
        'Values as fetched from the Store'
      );

      assert.deepEqual(
        mockModel
          .get('having')
          .objectAt(0)
          .get('value'),
        100,
        'Value computed from values'
      );

      mockModel.set('having.firstObject.value', 200);

      assert.deepEqual(
        mockModel
          .get('having')
          .objectAt(0)
          .get('values'),
        [200],
        'Values set from the value property'
      );
    });
  });

  test('Validations', async function(assert) {
    assert.expect(14);

    await settled();
    let having = run(function() {
      return Store.peekRecord('fragments-mock', 1)
        .get('having')
        .objectAt(0);
    });

    having.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Having is valid');
      assert.equal(validations.get('messages').length, 0, 'There are no validation errors');
    });

    having.set('metric', null);
    having.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Having is invalid');

      assert.equal(validations.get('messages').length, 1, 'There is one validation errors');

      assert.equal(
        validations.get('messages').objectAt(0),
        'The metric field in the having cannot be empty',
        'Metric cannot be empty is a part of the error messages'
      );
    });

    having.set('operator', undefined);
    having.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Having is invalid');

      assert.equal(validations.get('messages').length, 2, 'There are two validation errors');

      assert.equal(
        validations.get('messages').objectAt(1),
        'The operator field in the having cannot be empty',
        'Operator cannot be empty is a part of the error messages'
      );
    });

    having.set('values', []);
    having.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Having is invalid');

      assert.equal(validations.get('messages').length, 3, 'There are three validation errors');

      assert.equal(
        validations.get('messages').objectAt(2),
        'The values field in the having cannot be empty',
        'value should have some value assigned'
      );
    });

    having.set('metric', { metric: { name: 'Ad Clicks' }, parameters: {} });
    having.set('values', ['foo']);
    having.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Having is invalid');

      assert.equal(validations.get('messages').length, 2, 'There are two validation errors');

      assert.equal(
        validations.get('messages').objectAt(1),
        'Ad Clicks filter must be a number',
        'Having value should be numeric'
      );
    });
  });
});

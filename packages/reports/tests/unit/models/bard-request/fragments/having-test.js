import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';

var Store,
    MetadataService,
    RevenueMetric;

const { getOwner } = Ember;

moduleForModel('fragments-mock', 'Unit | Model Fragment | BardRequest - Having', {
  needs: [
    'transform:fragment-array',
    'transform:fragment',
    'transform:metric',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/having',
    'validator:array-number',
    'validator:length',
    'validator:presence',
    'service:bard-metadata',
    'adapter:bard-metadata',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'service:bard-dimensions',
    'adapter:dimensions/bard'
  ],

  beforeEach() {
    Store = getOwner(this).lookup('service:store');
    setupMock();

    MetadataService = getOwner(this).lookup('service:bard-metadata');

    return MetadataService.loadMetadata().then(() => {
      RevenueMetric = MetadataService.getById('metric', 'revenue');

      //Add instances to the store
      return Ember.run(() => {
        Store.pushPayload('fragments-mock', {
          data: {
            id: 1,
            type: 'fragments-mock',
            attributes: {
              having: [{
                metric: { metric: 'revenue', parameters: { currency: 'USD' } },
                operator: 'gt',
                values: [100]
              }]
            }
          }
        });
      });
    });
  },
  afterEach() {
    teardownMock();
  }
});

test('Model using the Having Fragment', function(assert) {
  assert.expect(8);

  let mockModel = Store.peekRecord('fragments-mock', 1),
      pageViewMetric = MetadataService.getById('metric', 'pageViews');

  assert.ok(mockModel, 'mockModel is fetched from the store');

  Ember.run(() => {

    assert.deepEqual(mockModel.get('having').objectAt(0).get('metric.metric'),
      RevenueMetric,
      'The property metric is deserialized to the `Revenue` metric metadata object');

    assert.deepEqual(mockModel.get('having').objectAt(0).get('metric.parameters'),
      { currency: 'USD' },
      'The property metric has the correct parameters object');

    assert.equal(mockModel.get('having').objectAt(0).get('operator'),
      'gt',
      'The property operator has the value `gt`');

    assert.deepEqual(mockModel.get('having').objectAt(0).get('values'),
      [100],
      'The property values has the value `100`');

    /* == Setter Method == */
    mockModel.get('having').objectAt(0).set('metric', Store.createFragment('bard-request/fragments/metric', {
      metric: pageViewMetric
    }));
    mockModel.get('having').objectAt(0).set('operator', 'gte');
    mockModel.get('having').objectAt(0).set('values', [350]);
  });

  assert.deepEqual(mockModel.get('having').objectAt(0).get('metric.metric'),
    pageViewMetric,
    'The property having has the metric with metadata for `Page Views` set using setter');

  assert.equal(mockModel.get('having').objectAt(0).get('operator'),
    'gte',
    'The property having has the operator `gte` set using setter');

  assert.deepEqual(mockModel.get('having').objectAt(0).get('values'),
    [ 350 ],
    'The property values has the value `[350]` set using setter');
});

test('Computed values', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    return Ember.run(() => {
      let mockModel = Store.peekRecord('fragments-mock', 1);

      assert.deepEqual(mockModel.get('having').objectAt(0).get('values'),
        [100],
        'Values as fetched from the Store');

      assert.deepEqual(mockModel.get('having').objectAt(0).get('value'),
        100,
        'Value computed from values');

      mockModel.set('having.firstObject.value', 200);

      assert.deepEqual(mockModel.get('having').objectAt(0).get('values'),
        [200],
        'Values set from the value property');
    });
  });
});

test('Validations', function(assert) {
  assert.expect(14);

  return wait().then(() => {
    let having = Ember.run(function () {
      return Store.peekRecord('fragments-mock', 1).get('having').objectAt(0);
    });

    having.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Having is valid');
      assert.equal(validations.get('messages').length, 0, 'There are no validation errors');
    });

    having.set('metric', null);
    having.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Having is invalid');

      assert.equal(validations.get('messages').length,
        1,
        'There is one validation errors');

      assert.equal(validations.get('messages').objectAt(0),
        'The metric field in the having cannot be empty',
        'Metric cannot be empty is a part of the error messages');
    });

    having.set('operator', undefined);
    having.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Having is invalid');

      assert.equal(validations.get('messages').length,
        2,
        'There are two validation errors');

      assert.equal(validations.get('messages').objectAt(1),
        'The operator field in the having cannot be empty',
        'Operator cannot be empty is a part of the error messages');
    });

    having.set('values', []);
    having.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Having is invalid');

      assert.equal(validations.get('messages').length,
        3,
        'There are three validation errors');

      assert.equal(validations.get('messages').objectAt(2),
        'The values field in the having cannot be empty',
        'value should have some value assigned');
    });

    having.set('metric', {metric: { longName: 'Ad Clicks' }, parameters: {}});
    having.set('values', ['foo']);
    having.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Having is invalid');

      assert.equal(validations.get('messages').length,
        2,
        'There are two validation errors');

      assert.equal(validations.get('messages').objectAt(1),
        'Ad Clicks filter must be a number',
        'Having value should be numeric');
    });
  });
});

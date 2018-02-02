import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';

const { getOwner } = Ember;

var Store,
    MetadataService;

moduleForModel('fragments-mock', 'Unit | Model | Fragment | BardRequest - Metric', {
  needs: [
    'transform:fragment-array',
    'transform:metric',
    'transform:fragment',
    'transform:fragment-array',
    'transform:table',
    'model:bard-request/fragments/metric',
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
    setupMock();

    Store = getOwner(this).lookup('service:store');
    MetadataService = getOwner(this).lookup('service:bard-metadata');

    MetadataService.loadMetadata().then(() => {
      //Add instances to the store
      return Ember.run(() => {
        Store.pushPayload({
          data: {
            id: 1,
            type: 'fragments-mock',
            attributes: {
              metrics: [{ metric: 'uniqueIdentifier' }]
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

test('Model using the Metric Fragment', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1);

    Ember.run(() => {
      /* == Getter Method == */
      assert.equal(mockModel.get('metrics').objectAt(0).get('metric.longName'),
        'Unique Identifiers',
        'The property metric `ui` was deserialized to the metric object with longName `Unique Identifiers`');

      /* == Setter Method == */
      mockModel.get('metrics').objectAt(0).set('metric', MetadataService.getById('metric', 'pageViews'));
    });

    assert.equal(mockModel.get('metrics').objectAt(0).get('metric.longName'),
      'Page Views',
      'The property metric is set as `Page Views` using the setter');

    /* == Serialize == */
    assert.deepEqual(mockModel.serialize().data.attributes.metrics,
      [{ metric: 'pageViews' }],
      'The model object was serialized correctly');
  });
});

test('Validations', function(assert) {
  assert.expect(5);

  return wait().then(() => {
    let metric = Ember.run(() => Store.peekRecord('fragments-mock', 1).get('metrics').objectAt(0));

    metric.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Metric is valid');
      assert.equal(validations.get('messages').length,
        0,
        'There are no validation errors');
    });

    metric.set('metric', undefined);

    metric.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Metric is invalid');

      assert.equal(validations.get('messages').length,
        1,
        'There is one validation errors');

      assert.equal(validations.get('messages').objectAt(0),
        'The metric field cannot be empty',
        'Metric cannot be empty is a part of the error messages');
    });
  });
});

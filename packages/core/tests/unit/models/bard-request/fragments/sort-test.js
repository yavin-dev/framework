import { moduleForModel, test } from 'ember-qunit';
import { startMirage } from '../../../../../initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';

var Store, MetadataService;

moduleForModel('fragments-mock', 'Unit | Model | Fragment | BardRequest - Sort', {
  // Specify the other units that are required for this test.
  needs: [
    'transform:fragment-array',
    'transform:table',
    'transform:fragment',
    'transform:metric',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
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
    this.server = startMirage();

    Store = getOwner(this).lookup('service:store');
    MetadataService = getOwner(this).lookup('service:bard-metadata');

    MetadataService.loadMetadata().then(() => {
      //Add instances to the store
      Store.pushPayload({
        data: {
          id: 1,
          type: 'fragments-mock',
          attributes: {
            sorts: [
              {
                metric: { metric: 'dayAvgUniqueIdentifier' }
              },
              {
                metric: { metric: 'timeSpent' },
                direction: 'desc'
              }
            ]
          }
        }
      });
    });
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('Model using the Sort Fragment', function(assert) {
  assert.expect(6);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1);
    assert.ok(mockModel, 'mockModel is fetched from the store');

    /* == Getter Method == */
    assert.equal(
      mockModel
        .get('sorts')
        .objectAt(0)
        .get('metric.metric.longName'),
      'Unique Identifiers (Daily Avg)',
      'The property metric `ui` was deserialized to the metric object with longName `Unique Identifiers (Daily Avg)`'
    );

    assert.equal(
      mockModel
        .get('sorts')
        .objectAt(0)
        .get('direction'),
      'desc',
      'The property direction has the default value `desc`'
    );

    /* == Setter Method == */
    mockModel
      .get('sorts')
      .objectAt(0)
      .set('metric', {
        metric: MetadataService.getById('metric', 'pageViews')
      });
    mockModel
      .get('sorts')
      .objectAt(0)
      .set('direction', 'asc');

    assert.equal(
      mockModel
        .get('sorts')
        .objectAt(0)
        .get('metric.metric.longName'),
      'Page Views',
      'The property sort has the metric with value  `Page Views` using the setter'
    );

    assert.equal(
      mockModel
        .get('sorts')
        .objectAt(0)
        .get('direction'),
      'asc',
      'The property sort has the direction `asc` set using setter'
    );

    /* == Serialize == */
    assert.deepEqual(
      mockModel.serialize().data.attributes.sorts,
      [
        {
          metric: { metric: 'pageViews', parameters: {} },
          direction: 'asc'
        },
        {
          metric: { metric: 'timeSpent', parameters: {} },
          direction: 'desc'
        }
      ],
      'The model object was serialized correctly'
    );
  });
});

test('Validations', function(assert) {
  assert.expect(8);

  return wait().then(() => {
    let sort = run(function() {
      return Store.peekRecord('fragments-mock', 1)
        .get('sorts')
        .objectAt(0);
    });

    sort.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Sort is valid');
      assert.equal(validations.get('messages').length, 0, 'There are no validation errors');
    });

    sort.set('metric', null);
    sort.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Sort is invalid');

      assert.equal(validations.get('messages').length, 1, 'There is one validation errors');

      assert.equal(
        validations.get('messages').objectAt(0),
        'The metric field in sort cannot be empty',
        'Metric cannot be empty is a part of the error messages'
      );
    });

    sort.set('direction', undefined);
    sort.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Sort is invalid');

      assert.equal(validations.get('messages').length, 2, 'There are two validation errors');

      assert.equal(
        validations.get('messages').objectAt(1),
        'The direction field in sort cannot be empty',
        'Direction cannot be empty is a part of the error messages'
      );
    });
  });
});

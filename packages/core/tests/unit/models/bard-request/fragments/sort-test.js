import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../../../helpers/mirage-helper';
import { run } from '@ember/runloop';

var Store, MetadataService;

module('Unit | Model | Fragment | BardRequest - Sort', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();

    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');

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
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('Model using the Sort Fragment', async function(assert) {
    assert.expect(6);

    await settled();
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
          metric: { metric: 'pageViews' },
          direction: 'asc'
        },
        {
          metric: { metric: 'timeSpent' },
          direction: 'desc'
        }
      ],
      'The model object was serialized correctly'
    );
  });

  test('Validations', async function(assert) {
    assert.expect(8);

    await settled();
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

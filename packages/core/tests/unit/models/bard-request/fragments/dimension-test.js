import { moduleForModel, test } from 'ember-qunit';
import { startMirage } from '../../../../../initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';

var Store,
    MetadataService;

moduleForModel('fragments-mock', 'Unit | Model Fragment | BardRequest - Dimension', {
  needs: [
    'transform:fragment',
    'transform:fragment-array',
    'transform:dimension',
    'transform:table',
    'model:bard-request/fragments/dimension',
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
      run(() => {
        Store.pushPayload({
          data: {
            id: 1,
            type: 'fragments-mock',
            attributes: {
              dimensions: [
                { dimension: 'age' }
              ]
            }
          }
        });
      });
    });
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('Model using the Dimension Fragment', function(assert) {
  assert.expect(3);

  let mockModel;

  return wait().then(() => {
    run(() => {
      mockModel = Store.peekRecord('fragments-mock', 1);

      /* == Getter Method == */
      assert.equal(mockModel.get('dimensions').objectAt(0).get('dimension.longName'),
        'Age',
        'The property Dimension with id `age` was deserialized correctly with the longName `Age`');

      /* == Setter Method == */
      mockModel.get('dimensions').objectAt(0).set('dimension',
        MetadataService.getById('dimension', 'loginState'));
    });

    assert.equal(mockModel.get('dimensions').objectAt(0).get('dimension.longName'),
      'Logged-in State',
      'The property dimension was set to `Login State` using the setter');

    /* == Serialize Method == */
    assert.deepEqual(mockModel.serialize().data.attributes.dimensions,
      [{ dimension: 'loginState' }],
      'The model object was serialized correctly');
  });
});

test('Validations', function(assert) {
  assert.expect(5);

  return wait().then(() => {
    let dimension = run(() => {
      return Store.peekRecord('fragments-mock', 1).get('dimensions').objectAt(0);
    });

    dimension.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Dimension is valid');
      assert.equal(validations.get('messages').length,
        0,
        'There are no validation errors');
    });

    dimension.set('dimension', null);
    dimension.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Dimension is invalid');

      assert.equal(validations.get('messages').length,
        1,
        'There is one validation errors');

      assert.equal(validations.get('messages').objectAt(0),
        'The dimension field cannot be empty',
        'Dimension cannot be empty is a part of the error messages');
    });
  });
});

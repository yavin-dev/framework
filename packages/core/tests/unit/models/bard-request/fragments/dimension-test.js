import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

let Store, MetadataService;

module('Unit | Model Fragment | BardRequest - Dimension', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');

    await MetadataService.loadMetadata().then(() => {
      //Add instances to the store
      run(() => {
        Store.pushPayload({
          data: {
            id: 1,
            type: 'fragments-mock',
            attributes: {
              dimensions: [{ dimension: 'age' }]
            }
          }
        });
      });
    });
  });

  test('Model using the Dimension Fragment', async function(assert) {
    assert.expect(3);

    let mockModel;

    await settled();
    run(() => {
      mockModel = Store.peekRecord('fragments-mock', 1);

      /* == Getter Method == */
      assert.equal(
        mockModel
          .get('dimensions')
          .objectAt(0)
          .get('dimension.longName'),
        'Age',
        'The property Dimension with id `age` was deserialized correctly with the longName `Age`'
      );

      /* == Setter Method == */
      mockModel
        .get('dimensions')
        .objectAt(0)
        .set('dimension', MetadataService.getById('dimension', 'loginState'));
    });

    assert.equal(
      mockModel
        .get('dimensions')
        .objectAt(0)
        .get('dimension.longName'),
      'Logged-in State',
      'The property dimension was set to `Login State` using the setter'
    );

    /* == Serialize Method == */
    assert.deepEqual(
      mockModel.serialize().data.attributes.dimensions,
      [{ dimension: 'loginState' }],
      'The model object was serialized correctly'
    );
  });

  test('Validations', async function(assert) {
    assert.expect(5);

    await settled();
    let dimension = run(() => {
      return Store.peekRecord('fragments-mock', 1)
        .get('dimensions')
        .objectAt(0);
    });

    dimension.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Dimension is valid');
      assert.equal(validations.get('messages').length, 0, 'There are no validation errors');
    });

    dimension.set('dimension', null);
    dimension.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Dimension is invalid');

      assert.equal(validations.get('messages').length, 1, 'There is one validation errors');

      assert.equal(
        validations.get('messages').objectAt(0),
        'The dimension field cannot be empty',
        'Dimension cannot be empty is a part of the error messages'
      );
    });
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { run } from '@ember/runloop';

let Store, MetadataService;

module('Unit | Model Fragment | BardRequest - Logical Table', function(hooks) {
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
              table: {
                table: 'network',
                timeGrain: 'day'
              }
            }
          }
        });
      });
    });
  });

  test('Model using the Logical Table Fragment', function(assert) {
    assert.expect(5);

    let mockModel = Store.peekRecord('fragments-mock', 1);
    assert.ok(mockModel, 'mockModel is fetched from the store');

    run(() => {
      /* == Getter Method == */
      assert.equal(
        mockModel.get('table.table.description'),
        'Network, Product, and Property level data',
        'The property `table` has the description `Network table`'
      );

      assert.equal(mockModel.get('table.timeGrain'), 'day', 'The property `table` has the time grain `day`');

      /* == Setter Method == */
      mockModel.set('table.table', MetadataService.getById('table', 'tableA'));
      mockModel.set('table.timeGrain', 'week');

      assert.equal(
        mockModel.get('table.table.description'),
        'Table A',
        'The property `table` has been updated with the description `Table A`'
      );

      assert.equal(
        mockModel.table?.timeGrain,
        'week',
        'The property `table` has been updated with the time grain `week`'
      );
    });
  });

  test('Validations', async function(assert) {
    assert.expect(8);

    await settled();
    let logicalTable = run(function() {
      return Store.peekRecord('fragments-mock', 1).get('table');
    });

    logicalTable.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Logical Table is valid');
      assert.equal(validations.get('messages').length, 0, 'There are no validation errors');
    });

    logicalTable.set('table', undefined);
    logicalTable.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Logical Table is invalid');

      assert.equal(validations.get('messages').length, 1, 'There is one validation error');

      assert.equal(
        validations.get('messages').objectAt(0),
        'Table is invalid or unavailable',
        'Table is invalid or unavailable is a part of the error messages'
      );
    });

    logicalTable.set('timeGrain', '');
    logicalTable.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Logical Table is invalid');

      assert.equal(validations.get('messages').length, 2, 'There are two validation errors');

      assert.equal(
        validations.get('messages').objectAt(1),
        'The timeGrain field cannot be empty',
        'Time Grain Name cannot be empty is a part of the error messages'
      );
    });
  });
});

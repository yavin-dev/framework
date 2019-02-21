import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../../../helpers/mirage-helper';
import { run } from '@ember/runloop';

var Store, MetadataService;

module('Unit | Model Fragment | BardRequest - Logical Table', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    setupMock();
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');

    await MetadataService.loadMetadata().then(() => {
      //Add instances to the store
      return run(() => {
        Store.pushPayload({
          data: {
            id: 1,
            type: 'fragments-mock',
            attributes: {
              table: {
                table: 'network',
                timeGrainName: 'day'
              }
            }
          }
        });
      });
    });
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('Model using the Logical Table Fragment', function(assert) {
    assert.expect(5);

    let mockModel = Store.peekRecord('fragments-mock', 1);
    assert.ok(mockModel, 'mockModel is fetched from the store');

    return run(() => {
      /* == Getter Method == */
      assert.equal(
        mockModel.get('table.table.description'),
        'Network, Product, and Property level data',
        'The property `table` has the description `Network table`'
      );

      assert.equal(mockModel.get('table.timeGrainName'), 'day', 'The property `table` has the time grain `day`');

      /* == Setter Method == */
      mockModel.set('table.table', MetadataService.getById('table', 'tableA'));
      mockModel.set('table.timeGrainName', 'week');

      assert.equal(
        mockModel.get('table.table.description'),
        'Table A',
        'The property `table` has been updated with the description `Table A`'
      );

      assert.equal(
        mockModel.get('table.timeGrainName'),
        'week',
        'The property `table` has been updated with the time grain `week`'
      );
    });
  });

  test('Computed timeGrains', function(assert) {
    assert.expect(3);

    return settled().then(() => {
      return run(() => {
        let mockModel = Store.peekRecord('fragments-mock', 1);

        assert.equal(
          mockModel.get('table.timeGrain.longName'),
          'Day',
          'Network Daily Time Grain Object is fetched from the store'
        );

        let mockTimeGrain = {
          name: 'week',
          longName: 'Week'
        };
        mockModel.set('table.timeGrain', mockTimeGrain);

        assert.equal(
          mockModel.get('table.timeGrain.longName'),
          'Week',
          'Network Weekly Time Grain Object is fetched from the store'
        );

        assert.equal(
          mockModel.get('table.timeGrainName'),
          'week',
          'The property `table` has been updated with the time grain `week`'
        );
      });
    });
  });

  test('timeGrain updates when table changed', function(assert) {
    assert.expect(2);

    return settled().then(() => {
      let mockModel = Store.peekRecord('fragments-mock', 1);

      run(() => {
        assert.equal(
          mockModel.get('table.timeGrain.longName'),
          'Day',
          'Network Daily Time Grain Object is set by default'
        );

        mockModel.set('table.table', MetadataService.getById('table', 'tableA'));

        assert.equal(
          mockModel.get('table.timeGrain.longName'),
          'Day',
          'Table A Daily Time Grain Object is set by default'
        );
      });
    });
  });

  test('Validations', function(assert) {
    assert.expect(8);

    return settled().then(() => {
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

      logicalTable.set('timeGrainName', '');
      logicalTable.validate().then(({ validations }) => {
        assert.ok(!validations.get('isValid'), 'Logical Table is invalid');

        assert.equal(validations.get('messages').length, 2, 'There are two validation errors');

        assert.equal(
          validations.get('messages').objectAt(1),
          'The timeGrainName field cannot be empty',
          'Time Grain Name cannot be empty is a part of the error messages'
        );
      });
    });
  });
});

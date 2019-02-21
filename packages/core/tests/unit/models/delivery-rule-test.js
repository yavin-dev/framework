import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

let Store, MetadataService;

const ExpectedDeliveryRule = {
  createdOn: '2017-01-01 00:00:00.000',
  updatedOn: '2017-01-01 00:00:00.000',
  owner: 'navi_user',
  deliveredItem: '3',
  deliveryType: 'report',
  frequency: 'week',
  schedulingRules: {
    stopAfter: '2017-09-04 00:00:00',
    every: '2 weeks'
  },
  format: {
    type: 'csv'
  },
  recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
  version: 1
};

module('Unit | Model | delivery rule', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('Retrieving records', function(assert) {
    assert.expect(2);

    return run(() => {
      return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
        assert.ok(deliveryRule, 'Found deliveryRule with id 1');

        assert.deepEqual(
          deliveryRule.toJSON(),
          ExpectedDeliveryRule,
          'Fetched deliveryRule has all attributes as expected'
        );
      });
    });
  });

  test('user relationship', function(assert) {
    assert.expect(1);

    return run(() => {
      return Store.findRecord('user', 'navi_user').then(userModel => {
        return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
          return deliveryRule.get('owner').then(owner => {
            assert.equal(owner, userModel, 'deliveryRule author property contains user model');
          });
        });
      });
    });
  });

  test('delivered item relationship', function(assert) {
    assert.expect(1);

    return run(() => {
      return Store.findRecord('report', 3).then(reportModel => {
        return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
          return deliveryRule.get('deliveredItem').then(item => {
            assert.equal(item, reportModel, 'deliveryRule deliveredItem property contains report model');
          });
        });
      });
    });
  });

  test('Validations', function(assert) {
    assert.expect(14);

    return run(() => {
      return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
        return deliveryRule.get('deliveredItem').then(() => {
          deliveryRule.validate().then(({ validations }) => {
            assert.ok(validations.get('isValid'), 'deliveryRule is valid');
            assert.equal(validations.get('messages').length, 0, 'There are no validation errors');
          });

          //setting format to null
          deliveryRule.set('format', null);
          deliveryRule.validate().then(({ model, validations }) => {
            assert.notOk(validations.get('isValid'), 'deliveryRule is invalid');
            assert.equal(validations.get('messages').length, 1, 'One Field is invalid in the deliveryRule model');
            assert.notOk(model.get('validations.attrs.format.isValid'), 'Delivery format must have a value');
          });

          //setting frequency to null
          deliveryRule.set('frequency', null);
          deliveryRule.validate().then(({ model, validations }) => {
            assert.notOk(validations.get('isValid'), 'deliveryRule is invalid');
            assert.equal(validations.get('messages').length, 2, 'Two Fields are invalid in the deliveryRule model');
            assert.notOk(model.get('validations.attrs.frequency.isValid'), 'Delivery frequency must have a value');
          });

          //setting no recipients
          deliveryRule.set('recipients', []);
          deliveryRule.validate().then(({ model, validations }) => {
            assert.notOk(validations.get('isValid'), 'deliveryRule is invalid');
            assert.equal(validations.get('messages').length, 3, 'Three Fields are invalid in the deliveryRule model');
            assert.notOk(model.get('validations.attrs.recipients.isValid'), 'There must be at least one recipient');
          });

          //setting recipients with invalid emails
          deliveryRule.set('recipients', ['user@bad', 'otherUser']);
          deliveryRule.validate().then(({ model, validations }) => {
            assert.notOk(validations.get('isValid'), 'deliveryRule is invalid');
            assert.equal(validations.get('messages').length, 3, 'Three Fields are invalid in the deliveryRule model');
            assert.notOk(
              model.get('validations.attrs.recipients.isValid'),
              'Recipients must have valid email addresses'
            );
          });
        });
      });
    });
  });
});

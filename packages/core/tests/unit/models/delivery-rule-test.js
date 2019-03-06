import { run } from '@ember/runloop';
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

  test('Retrieving records', async function(assert) {
    assert.expect(2);

    await run(async () => {
      const deliveryRule = await Store.findRecord('deliveryRule', 1);
      assert.ok(deliveryRule, 'Found deliveryRule with id 1');

      assert.deepEqual(
        deliveryRule.toJSON(),
        ExpectedDeliveryRule,
        'Fetched deliveryRule has all attributes as expected'
      );
    });
  });

  test('user relationship', async function(assert) {
    assert.expect(1);

    await run(async () => {
      const userModel = await Store.findRecord('user', 'navi_user');
      const deliveryRule = await Store.findRecord('deliveryRule', 1);
      const owner = await deliveryRule.get('owner');

      assert.equal(owner, userModel, 'deliveryRule author property contains user model');
    });
  });

  test('delivered item relationship', async function(assert) {
    assert.expect(1);

    await run(async () => {
      const reportModel = await Store.findRecord('report', 3);
      const deliveryRule = await Store.findRecord('deliveryRule', 1);
      const item = await deliveryRule.get('deliveredItem');

      assert.equal(item, reportModel, 'deliveryRule deliveredItem property contains report model');
    });
  });

  test('Validations', async function(assert) {
    assert.expect(14);

    await run(async () => {
      const deliveryRule = await Store.findRecord('deliveryRule', 1);
      await deliveryRule.get('deliveredItem');
      const v1 = await deliveryRule.validate();

      assert.ok(v1.validations.get('isValid'), 'deliveryRule is valid');
      assert.equal(v1.validations.get('messages').length, 0, 'There are no validation errors');

      //setting format to null
      deliveryRule.set('format', null);
      const v2 = await deliveryRule.validate();

      assert.notOk(v2.validations.get('isValid'), 'deliveryRule is invalid');
      assert.equal(v2.validations.get('messages').length, 1, 'One Field is invalid in the deliveryRule model');
      assert.notOk(v2.model.get('validations.attrs.format.isValid'), 'Delivery format must have a value');

      //setting frequency to null
      deliveryRule.set('frequency', null);
      const v3 = await deliveryRule.validate();
      assert.notOk(v3.validations.get('isValid'), 'deliveryRule is invalid');
      assert.equal(v3.validations.get('messages').length, 2, 'Two Fields are invalid in the deliveryRule model');
      assert.notOk(v3.model.get('validations.attrs.frequency.isValid'), 'Delivery frequency must have a value');

      //setting no recipients
      deliveryRule.set('recipients', []);
      const v4 = await deliveryRule.validate();
      assert.notOk(v4.validations.get('isValid'), 'deliveryRule is invalid');
      assert.equal(v4.validations.get('messages').length, 3, 'Three Fields are invalid in the deliveryRule model');
      assert.notOk(v4.model.get('validations.attrs.recipients.isValid'), 'There must be at least one recipient');

      //setting recipients with invalid emails
      deliveryRule.set('recipients', ['user@bad', 'otherUser']);
      const v5 = await deliveryRule.validate();
      assert.notOk(v5.validations.get('isValid'), 'deliveryRule is invalid');
      assert.equal(v5.validations.get('messages').length, 3, 'Three Fields are invalid in the deliveryRule model');
      assert.notOk(v5.model.get('validations.attrs.recipients.isValid'), 'Recipients must have valid email addresses');
    });
  });
});

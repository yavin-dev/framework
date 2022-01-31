import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

let Store;

const ExpectedDeliveryRule = {
  createdOn: '2017-01-01 00:00:00.000',
  updatedOn: '2017-01-01 00:00:00.000',
  owner: 'navi_user',
  deliveredItem: '3',
  delivery: 'email',
  deliveryType: 'report',
  frequency: 'week',
  schedulingRules: {
    mustHaveData: false,
  },
  format: {
    type: 'csv',
    options: {},
  },
  recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
  version: 1,
  isDisabled: false,
};

module('Unit | Model | delivery rule', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    Store = this.owner.lookup('service:store');
    return this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('Retrieving records', async function (assert) {
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

  test('user relationship', async function (assert) {
    assert.expect(1);

    await run(async () => {
      const userModel = await Store.findRecord('user', 'navi_user');
      const deliveryRule = await Store.findRecord('deliveryRule', 1);
      const owner = await deliveryRule.get('owner');

      assert.equal(owner, userModel, 'deliveryRule owner property contains user model');
    });
  });

  test('delivered item relationship', async function (assert) {
    assert.expect(1);

    await run(async () => {
      const reportModel = await Store.findRecord('report', 3);
      const deliveryRule = await Store.findRecord('deliveryRule', 1);
      const item = await deliveryRule.get('deliveredItem');

      assert.equal(item, reportModel, 'deliveryRule deliveredItem property contains report model');
    });
  });

  test('Validations', async function (assert) {
    assert.expect(20);

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

      //setting delivery to null
      deliveryRule.set('delivery', null);
      const v6 = await deliveryRule.validate();
      assert.notOk(v6.validations.get('isValid'), 'deliveryRule is invalid');
      assert.equal(v6.validations.get('messages').length, 4, 'Four Fields are invalid in the deliveryRule model');
      assert.notOk(v6.model.get('validations.attrs.delivery.isValid'), 'Delivery option must have a value');

      //setting frequency to null
      deliveryRule.set('isDisabled', null);
      const v7 = await deliveryRule.validate();
      assert.notOk(v7.validations.get('isValid'), 'deliveryRule is invalid');
      assert.equal(v7.validations.get('messages').length, 5, 'Five Fields are invalid in the deliveryRule model');
      assert.notOk(v7.model.get('validations.attrs.isDisabled.isValid'), 'isDisabled is not defined');
    });
  });

  test('No Delivery Validations', async function (assert) {
    assert.expect(4);

    await run(async () => {
      const deliveryRule = await Store.findRecord('deliveryRule', 1);
      await deliveryRule.get('deliveredItem');
      const v1 = await deliveryRule.validate();

      assert.ok(v1.validations.get('isValid'), 'deliveryRule is valid');
      assert.equal(v1.validations.get('messages').length, 0, 'There are no validation errors');

      deliveryRule.set('delivery', 'none');
      deliveryRule.set('recipients', []);
      deliveryRule.set('format', null);

      const v2 = await deliveryRule.validate();
      assert.ok(v2.validations.get('isValid'), 'deliveryRule is valid');
      assert.equal(v2.validations.get('messages').length, 0, 'There are no validation errors');
    });
  });

  test('Format options', async function (assert) {
    const deliveryRule = await Store.findRecord('deliveryRule', 1);
    deliveryRule.format.type = 'gsheet';
    deliveryRule.format.options.overwriteFile = true;
    assert.deepEqual(deliveryRule.toJSON().format, {
      type: 'gsheet',
      options: {
        overwriteFile: true,
      },
    });
  });

  test('Retrieving gsheet records', async function (assert) {
    assert.expect(6);

    await run(async () => {
      const deliveryRuleNoOptions = await Store.findRecord('deliveryRule', 4);
      assert.ok(deliveryRuleNoOptions, 'Found deliveryRule with id 4');

      const deliveryRuleWOptions = await Store.findRecord('deliveryRule', 5);
      assert.ok(deliveryRuleWOptions, 'Found deliveryRule with id 4');

      assert.equal(deliveryRuleNoOptions.format.type, 'gsheet', 'Gets the right format type');
      assert.equal(deliveryRuleWOptions.format.type, 'gsheet', 'Gets the right format type');

      assert.notOk(deliveryRuleNoOptions.format.options.overwriteFile, 'overwrite file default to false');
      assert.ok(deliveryRuleWOptions.format.options.overwriteFile, 'overwrite file is set when it is correctly set');
    });
  });
});

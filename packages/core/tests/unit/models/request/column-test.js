import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let mockModel;

module('Unit | Model | Request | Column', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    mockModel = run(() =>
      this.owner.lookup('service:store').createRecord('fragments-v2-mock', {
        columns: [
          {
            field: 'network.dateTime',
            parameters: { grain: 'day' },
            type: 'timeDimension',
            alias: 'time',
            source: 'bardOne',
          },
        ],
      })
    );
  });

  test('Model using the Column Fragment', async function (assert) {
    assert.ok(mockModel, 'mockModel is fetched from the store');

    const column = mockModel.columns.objectAt(0);

    assert.equal(column.field, 'network.dateTime', 'the `field` property has the correct value');
    assert.equal(column.cid.length, 10, 'the `cid` property has the correct value');

    assert.deepEqual(column.parameters, { grain: 'day' }, 'the `parameters` property has the correct object');

    assert.equal(column.type, 'timeDimension', 'the `type` property has the correct value');

    assert.equal(column.alias, 'time', 'the `alias` property has the correct value');

    column.set('field', 'revenue');
    column.set('parameters', { currency: 'USD' });
    column.set('type', 'metric');
    column.set('alias', 'revenueUSD');

    assert.equal(column.field, 'revenue', 'the `field` property is set correctly');

    assert.deepEqual(column.parameters, { currency: 'USD' }, 'the `parameters` property is set correctly');

    assert.equal(column.type, 'metric', 'the `type` property is set correctly');

    assert.equal(column.alias, 'revenueUSD', 'the `alias` property is set correctly');

    assert.equal(column.columnMetadata.id, 'revenue', 'metadata is populated with the right field');
  });

  test('Validation', async function (assert) {
    const column = mockModel.columns.objectAt(0);

    assert.ok(column.validations.isValid, 'column is valid');
    assert.equal(column.validations.messages.length, 0, 'there are no validation errors for a valid column');

    column.set('type', null);
    assert.ok(column.validations.isValid, 'a column without `type` is valid');
    assert.equal(column.validations.messages.length, 0, 'there are no validation errors for a column without type');

    column.set('type', 'foo');
    assert.notOk(column.validations.isValid, 'a column with an invalid `type` is invalid');
    assert.deepEqual(
      column.validations.messages,
      ['The `type` field of `network.dateTime` column must equal to `dimension`, `metric`, or `timeDimension`'],
      'error messages collection is correct for a column with an invalid `type`'
    );

    column.set('type', 'dimension');
    column.set('field', null);
    assert.notOk(column.validations.isValid, 'a column without `field` is invalid');
    assert.deepEqual(
      column.validations.messages,
      ['The `field` field cannot be empty'],
      'error messages collection is correct for a column without `field`'
    );
  });

  test('Serialization', async function (assert) {
    const { cid } = mockModel.columns.firstObject;
    assert.deepEqual(
      mockModel.serialize().data.attributes.columns,
      [
        {
          cid,
          alias: 'time',
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
      ],
      'The columns model attribute was serialized correctly'
    );

    mockModel.columns.objectAt(0).set('parameters', {});

    assert.deepEqual(
      mockModel.serialize().data.attributes.columns,
      [
        {
          cid,
          alias: 'time',
          field: 'network.dateTime',
          parameters: {},
          type: 'timeDimension',
        },
      ],
      'The columns model attribute was serialized correctly when parameters is an empty object'
    );
  });

  test('Display Name', async function (assert) {
    const column = mockModel.columns.objectAt(0);

    assert.equal(column.displayName, 'time', 'Display name is as expected with an alias');

    column.set('alias', null);
    assert.equal(column.displayName, 'Date Time (day)', 'Display name is as expected without an alias and with params');

    column.set('parameters', {});
    assert.equal(column.displayName, 'Date Time', 'Display name is as expected without params or an alias');
  });

  test('sortedDirection', async function (assert) {
    const column = mockModel.columns.objectAt(0);

    assert.strictEqual(column.sortedDirection, null, 'sortDirection is null by default');

    mockModel.sorts.addFragment({
      field: 'network.dateTime',
      parameters: { grain: 'day' },
      type: 'timeDimension',
      direction: 'asc',
      source: 'bardOne',
    });
    const sort = mockModel.sorts.objectAt(0);

    assert.strictEqual(column.sortedDirection, 'asc', 'sortDirection is updated when a sort is added');

    sort.set('direction', 'desc');
    assert.strictEqual(column.sortedDirection, 'desc', 'sortDirection is updated when a sort is updated');
  });
});

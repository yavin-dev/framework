import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let mockModel;

module('Unit | Model | Fragment | BardRequest V2 - Column', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:bard-metadata').loadMetadata();
    mockModel = run(() =>
      this.owner.lookup('service:store').createRecord('fragments-v2-mock', {
        columns: [
          {
            field: 'dateTime',
            parameters: { grain: 'day' },
            type: 'dimension',
            alias: 'time'
          }
        ]
      })
    );
  });

  test('Model using the Column Fragment', async function(assert) {
    assert.expect(10);

    assert.ok(mockModel, 'mockModel is fetched from the store');

    const column = mockModel.columns.objectAt(0);

    assert.equal(column.field, 'dateTime', 'the `field` property has the correct value');

    assert.deepEqual(column.parameters, { grain: 'day' }, 'the `parameters` property has the correct object');

    assert.equal(column.type, 'dimension', 'the `type` property has the correct value');

    assert.equal(column.alias, 'time', 'the `alias` property has the correct value');

    column.set('field', 'revenue');
    column.set('parameters', { currency: 'USD' });
    column.set('type', 'metric');
    column.set('alias', 'revenueUSD');

    assert.equal(column.field, 'revenue', 'the `field` property is set correctly');

    assert.deepEqual(column.parameters, { currency: 'USD' }, 'the `parameters` property is set correctly');

    assert.equal(column.type, 'metric', 'the `type` property is set correctly');

    assert.equal(column.alias, 'revenueUSD', 'the `alias` property is set correctly');

    column.applyMeta('metric', 'dummy');
    assert.equal(column.columnMeta.id, 'revenue', 'metadata is populated with the right field');
  });

  test('Validation', async function(assert) {
    assert.expect(8);

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
      ['The `type` field of `dateTime` column must equal to `dimension` or `metric`'],
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

  test('Serialization', async function(assert) {
    assert.expect(3);

    assert.deepEqual(
      mockModel.serialize().data.attributes.columns,
      [
        {
          alias: 'time',
          field: 'dateTime',
          parameters: {
            grain: 'day'
          },
          type: 'dimension'
        }
      ],
      'The columns model attribute was serialized correctly'
    );

    mockModel.columns.objectAt(0).set('parameters', {});

    assert.deepEqual(
      mockModel.serialize().data.attributes.columns,
      [
        {
          alias: 'time',
          field: 'dateTime',
          type: 'dimension'
        }
      ],
      'The columns model attribute was serialized correctly when parameters is an empty object'
    );

    mockModel.columns.objectAt(0).set('parameters', null);

    assert.deepEqual(
      mockModel.serialize().data.attributes.columns,
      [
        {
          alias: 'time',
          field: 'dateTime',
          type: 'dimension'
        }
      ],
      'The columns model attribute was serialized correctly when parameters is null'
    );
  });
});

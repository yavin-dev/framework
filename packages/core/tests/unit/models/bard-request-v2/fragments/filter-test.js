import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let mockModel;

module('Unit | Model | Fragment | BardRequest - Filter', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    mockModel = run(() =>
      this.owner.lookup('service:store').createRecord('fragments-v2-mock', {
        filters: [
          {
            field: 'revenue',
            parameters: { currency: 'USD' },
            type: 'metric',
            operator: 'gt',
            values: [3],
            source: 'bardOne'
          }
        ]
      })
    );
  });

  test('Model using the Filter Fragment', async function(assert) {
    assert.expect(10);

    assert.ok(mockModel, 'mockModel is fetched from the store');

    const filter = mockModel.filters.objectAt(0);

    assert.equal(filter.field, 'revenue', 'the `field` property has the correct value');

    assert.deepEqual(filter.parameters, { currency: 'USD' }, 'the `parameters` property has the correct object');

    assert.equal(filter.operator, 'gt', 'the `operator` property has the correct value');

    assert.deepEqual(filter.values, [3], 'the `values` property has the correct values');

    filter.set('type', 'timeDimension');
    filter.set('field', 'dateTime');
    filter.set('parameters', {});
    filter.set('operator', 'bet');
    filter.set('values', ['P1D', 'current']);

    assert.equal(filter.field, 'dateTime', 'the `field` property is set correctly');

    assert.deepEqual(filter.parameters, {}, 'the `parameters` property is set correctly');

    assert.equal(filter.operator, 'bet', 'the `operator` property is set correctly');

    assert.deepEqual(filter.values, ['P1D', 'current'], 'the `values` property is set correctly');

    assert.equal(filter.columnMetadata.id, 'dateTime', 'metadata is loaded correctly');
  });

  test('Validation', async function(assert) {
    assert.expect(8);

    const filter = mockModel.filters.objectAt(0);

    assert.ok(filter.validations.isValid, 'filter is valid');
    assert.equal(filter.validations.messages.length, 0, 'there are no validation errors for a valid filter');

    filter.set('operator', null);
    assert.notOk(filter.validations.isValid, 'a filter without an `operator` is invalid');
    assert.deepEqual(
      filter.validations.messages,
      ['The `operator` filter field cannot be empty'],
      'error messages collection is correct for a filter without an `operator`'
    );

    filter.set('operator', 'gt');
    filter.set('field', null);
    assert.notOk(filter.validations.isValid, 'a filter without `field` is invalid');
    assert.deepEqual(
      filter.validations.messages,
      ['The `field` field cannot be empty'],
      'error messages collection is correct for a column without `field`'
    );

    filter.set('field', 'revenue');
    filter.set('values', null);
    assert.notOk(filter.validations.isValid, 'a filter without `values` is invalid');
    assert.deepEqual(
      filter.validations.messages,
      ['revenue filter must be a collection'],
      'error messages collection is correct for a filter without `values`'
    );
  });

  test('Serialization', async function(assert) {
    assert.expect(2);

    assert.deepEqual(
      mockModel.serialize().data.attributes.filters,
      [
        {
          field: 'revenue',
          parameters: {
            currency: 'USD'
          },
          type: 'metric',
          operator: 'gt',
          values: [3]
        }
      ],
      'The filters model attribute was serialized correctly'
    );

    mockModel.filters.objectAt(0).set('parameters', {});

    assert.deepEqual(
      mockModel.serialize().data.attributes.filters,
      [
        {
          field: 'revenue',
          parameters: {},
          operator: 'gt',
          type: 'metric',
          values: [3]
        }
      ],
      'The filters model attribute was serialized correctly when parameters is an empty object'
    );
  });
});

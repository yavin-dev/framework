import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let mockModel;

module('Unit | Model | Fragment | BardRequest - Sort', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:bard-metadata').loadMetadata();
    mockModel = run(() =>
      this.owner.lookup('service:store').createRecord('fragments-v2-mock', {
        sorts: [
          {
            field: 'revenue',
            type: 'metric',
            parameters: { currency: 'USD' },
            source: 'bardOne'
          }
        ]
      })
    );
  });

  test('Model using the Sort Fragment', async function(assert) {
    assert.expect(8);

    assert.ok(mockModel, 'mockModel is fetched from the store');

    const sort = mockModel.sorts.objectAt(0);

    assert.equal(sort.field, 'revenue', 'the `field` property has the correct value');

    assert.deepEqual(sort.parameters, { currency: 'USD' }, 'the `parameters` property has the correct object');

    assert.equal(sort.direction, 'desc', 'the `direction` property defaults to `desc`');

    sort.set('field', 'dateTime');
    sort.set('parameters', { grain: 'day' });
    sort.set('direction', 'asc');

    assert.equal(sort.field, 'dateTime', 'the `field` property is set correctly');

    assert.deepEqual(sort.parameters, { grain: 'day' }, 'the `parameters` property is set correctly');

    assert.equal(sort.direction, 'asc', 'the `direction` property is set correctly');
    assert.equal(sort.columnMetadata.id, 'dateTime', 'correct meta data is populated');
  });

  test('Validation', async function(assert) {
    assert.expect(8);

    const sort = mockModel.sorts.objectAt(0);

    assert.ok(sort.validations.isValid, 'sort is valid');
    assert.equal(sort.validations.messages.length, 0, 'there are no validation errors for a valid sort');

    sort.set('direction', null);
    assert.notOk(sort.validations.isValid, 'a sort without a `direction` is invalid');
    assert.deepEqual(
      sort.validations.messages,
      ['The `direction` sort field must equal to `asc` or `desc`'],
      'error messages collection is correct for a sort without a `direction`'
    );

    sort.set('direction', 'foo');
    assert.notOk(sort.validations.isValid, 'a sort with an invalid `direction` is invalid');
    assert.deepEqual(
      sort.validations.messages,
      ['The `direction` sort field must equal to `asc` or `desc`'],
      'error messages collection is correct for a sort with an invalid `direction`'
    );

    sort.set('direction', 'desc');
    sort.set('field', null);
    assert.notOk(sort.validations.isValid, 'a sort without `field` is invalid');
    assert.deepEqual(
      sort.validations.messages,
      ['The `field` field cannot be empty'],
      'error messages collection is correct for a sort without `field`'
    );
  });

  test('Serialization', async function(assert) {
    assert.expect(2);

    assert.deepEqual(
      mockModel.serialize().data.attributes.sorts,
      [
        {
          field: 'revenue',
          parameters: {
            currency: 'USD'
          },
          type: 'metric',
          direction: 'desc'
        }
      ],
      'The sort model attribute was serialized correctly'
    );

    mockModel.sorts.objectAt(0).set('parameters', {});

    assert.deepEqual(
      mockModel.serialize().data.attributes.sorts,
      [
        {
          field: 'revenue',
          type: 'metric',
          parameters: {},
          direction: 'desc'
        }
      ],
      'The sort model attribute was serialized correctly when parameters is an empty object'
    );
  });
});

import { module, test } from 'qunit';
import DimensionMetadataModel, { DimensionMetadataPayload } from 'navi-data/models/metadata/dimension';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';
import { TestContext } from 'ember-test-helpers';
//@ts-ignore
import metadataRoutes from 'navi-data/test-support/helpers/metadata-routes';

let Payload: DimensionMetadataPayload, Dimension: DimensionMetadataModel;

module('Unit | Metadata Model | Dimension', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    Payload = {
      id: 'age',
      name: 'Age',
      category: 'Audience',
      source: 'bardOne',
      valueType: 'text',
      type: 'field',
      storageStrategy: null,
      fields: [
        {
          name: 'id',
          description: 'description',
          tags: ['primaryKey', 'display'],
        },
        {
          name: 'desc',
          description: 'description',
          tags: ['description', 'display'],
        },
        { name: 'emptyTags', description: 'description', tags: [] },
        { name: 'missingTags', description: 'description' },
      ],
    };

    Dimension = DimensionMetadataModel.create(this.owner.ownerInjection(), Payload);
  });

  test('factory has identifierField defined', function (assert) {
    assert.expect(1);

    assert.equal(DimensionMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function (assert) {
    assert.expect(4);

    assert.deepEqual(Dimension.id, Payload.id, 'name property is hydrated properly');

    assert.equal(Dimension.name, Payload.name, 'longName property was properly hydrated');

    assert.equal(Dimension.category, Payload.category, 'category property was properly hydrated');

    assert.deepEqual(Dimension.fields, Payload.fields, 'fields property was properly hydrated');
  });

  test('getTagForField', function (assert) {
    assert.expect(5);

    assert.deepEqual(
      Dimension.getTagsForField('id'),
      Payload.fields?.[0].tags,
      'getTagsForField returns the correct tags for `id` field'
    );

    assert.deepEqual(
      Dimension.getTagsForField('emptyTags'),
      [],
      'getTagsForField returns an empty array for empty tags array'
    );

    assert.deepEqual(
      Dimension.getTagsForField('missingTags'),
      [],
      'getTagsForField returns an empty array when tags array is missing'
    );

    assert.deepEqual(
      Dimension.getTagsForField('missingField'),
      [],
      'getTagsForField returns an empty array when `fields` property is missing'
    );

    //@ts-expect-error
    assert.deepEqual(Dimension.getTagsForField(), [], 'getTagsForField returns an empty array when field is undefined');
  });

  test('getFieldsForTag', function (assert) {
    assert.expect(5);

    assert.deepEqual(
      Dimension.getFieldsForTag('primaryKey'),
      [Payload.fields?.[0]],
      'getFieldsForTag returns the correct field for tag `primaryKey`'
    );

    assert.deepEqual(
      Dimension.getFieldsForTag('description'),
      [Payload.fields?.[1]],
      'getFieldsForTag returns the correct field for tag `description`'
    );

    assert.deepEqual(
      Dimension.getFieldsForTag('display'),
      [Payload.fields?.[0], Payload.fields?.[1]],
      'getFieldsForTag returns the correct fields for tag `display`'
    );

    assert.deepEqual(
      Dimension.getFieldsForTag('missingTag'),
      [],
      'getFieldsForTag returns an empty array when tag is missing'
    );

    //@ts-expect-error
    assert.deepEqual(Dimension.getFieldsForTag(), [], 'getFieldsForTag returns an empty array when tag is undefined');
  });

  test('primaryKeyFieldName', function (assert) {
    assert.expect(5);

    assert.deepEqual(Dimension.primaryKeyFieldName, 'id', 'primaryKeyFieldName returned `id` as the primary key field');

    let nonId = DimensionMetadataModel.create({
      fields: [{ name: 'key', tags: ['primaryKey'] }],
    });
    assert.deepEqual(nonId.primaryKeyFieldName, 'key', 'primaryKeyFieldName returned `key` as the primary key field');

    let twoKeys = DimensionMetadataModel.create({
      fields: [
        { name: 'key1', tags: ['primaryKey'] },
        { name: 'key2', tags: ['primaryKey'] },
      ],
    });
    assert.deepEqual(
      twoKeys.primaryKeyFieldName,
      'key1',
      'primaryKeyFieldName returns the first field tagged as `primaryKey`'
    );

    let noFields = DimensionMetadataModel.create({});
    assert.deepEqual(
      noFields.primaryKeyFieldName,
      'id',
      'primaryKeyFieldName returns `id` when there is no `fields` metadata prop'
    );

    let noPriKey = DimensionMetadataModel.create({});
    assert.deepEqual(
      noPriKey.primaryKeyFieldName,
      'id',
      'primaryKeyFieldName returns `id` when there are no `primaryKey` tags'
    );
  });

  test('descriptionFieldName', function (assert) {
    assert.expect(5);

    assert.deepEqual(
      Dimension.descriptionFieldName,
      'desc',
      'descriptionFieldName returned `desc` as the description field'
    );

    let nonDesc = DimensionMetadataModel.create({
      fields: [{ name: 'name', tags: ['description'] }],
    });
    assert.deepEqual(
      nonDesc.descriptionFieldName,
      'name',
      'descriptionFieldName returned `name` as the description field'
    );

    let twoKeys = DimensionMetadataModel.create({
      fields: [
        { name: 'name1', tags: ['description'] },
        { name: 'name2', tags: ['description'] },
      ],
    });
    assert.deepEqual(
      twoKeys.descriptionFieldName,
      'name1',
      'descriptionFieldName returns the first field tagged as `description`'
    );

    let noFields = DimensionMetadataModel.create({});
    assert.deepEqual(
      noFields.descriptionFieldName,
      'desc',
      'descriptionFieldName returns `desc` when there is no `fields` metadata prop'
    );

    let noDesc = DimensionMetadataModel.create({});
    assert.deepEqual(
      noDesc.descriptionFieldName,
      'desc',
      'descriptionFieldName returns `desc` when there are no `description` tags'
    );
  });

  test('extended property', async function (assert) {
    const server = new Pretender(metadataRoutes);
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    const dimensionOne = DimensionMetadataModel.create(this.owner.ownerInjection(), {
      id: 'dimensionOne',
      source: 'bardOne',
    });

    const result = await dimensionOne.extended;
    const expected = await this.owner.lookup('service:navi-metadata').findById('dimension', dimensionOne.id, 'bardOne');
    assert.equal(result, expected, 'dimension model can fetch extended attributes');
    server.shutdown();
  });

  test('cardinality', function (assert) {
    const dimension = DimensionMetadataModel.create(this.owner.ownerInjection(), {
      cardinality: 'MEDIUM',
      type: 'field',
    });

    assert.equal(
      dimension.cardinality,
      'MEDIUM',
      'Dimension successfully gets its cardinality from its table when type of dimension is field'
    );

    const dimension2 = DimensionMetadataModel.create(this.owner.ownerInjection(), {
      cardinality: 'MEDIUM',
      type: 'ref',
    });

    assert.strictEqual(
      dimension2.cardinality,
      undefined,
      'Dimension cardinality returns undefined for non-field type dimension'
    );

    assert.throws(
      () => {
        //@ts-expect-error
        dimension2.cardinality = 'chicago cubity';
      },
      /Dimension cardinality should be set to a value included in CARDINALITY_SIZES/,
      'Assert fails when invalid cardinality value is set'
    );
  });

  test('idFieldName', async function (assert) {
    assert.expect(4);

    const TestDimension = DimensionMetadataModel.create(this.owner.ownerInjection(), {
      fields: [
        {
          name: 'identifier',
          tags: ['id'],
        },
      ],
    });

    assert.deepEqual(TestDimension.idFieldName, 'identifier', 'idFieldName returned `identifier` as the id field');

    let noId = DimensionMetadataModel.create({
      fields: [{ name: 'name', tags: ['something'] }],
    });
    assert.deepEqual(noId.idFieldName, 'id', 'idFieldName returned `id` as the default id field name');

    let twoKeys = DimensionMetadataModel.create({
      fields: [
        { name: 'name1', tags: ['id'] },
        { name: 'name2', tags: ['id'] },
      ],
    });
    assert.deepEqual(twoKeys.idFieldName, 'name1', 'idFieldName returns the first field tagged as `id`');

    let noFields = DimensionMetadataModel.create({});
    assert.deepEqual(noFields.idFieldName, 'id', 'idFieldName returns `id` when there is no `fields` metadata prop');
  });
});

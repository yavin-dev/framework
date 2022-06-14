import { module, test } from 'qunit';
import DimensionMetadataModel, { DimensionMetadataPayload } from '@yavin/client/models/metadata/dimension';
import { ValueSourceType } from '@yavin/client/models/metadata/elide/dimension';
import { nullInjector } from '../../../helpers/injector';

let Payload: DimensionMetadataPayload, Dimension: DimensionMetadataModel;

module('Unit | Metadata Model | Dimension', function (hooks) {
  hooks.beforeEach(function () {
    Payload = {
      id: 'age',
      name: 'Age',
      category: 'Audience',
      source: 'bardOne',
      valueType: 'text',
      isSortable: false,
      type: 'field',
      valueSourceType: ValueSourceType.TABLE,
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

    Dimension = new DimensionMetadataModel(nullInjector, Payload);
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

    //@ts-expect-error
    let nonId = new DimensionMetadataModel(nullInjector, {
      fields: [{ name: 'key', tags: ['primaryKey'] }],
    });
    assert.deepEqual(nonId.primaryKeyFieldName, 'key', 'primaryKeyFieldName returned `key` as the primary key field');

    //@ts-expect-error
    let twoKeys = new DimensionMetadataModel(nullInjector, {
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

    //@ts-expect-error
    let noFields = new DimensionMetadataModel(nullInjector, {});
    assert.deepEqual(
      noFields.primaryKeyFieldName,
      'id',
      'primaryKeyFieldName returns `id` when there is no `fields` metadata prop'
    );

    //@ts-expect-error
    let noPriKey = new DimensionMetadataModel(nullInjector, {});
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

    //@ts-expect-error
    let nonDesc = new DimensionMetadataModel(nullInjector, {
      fields: [{ name: 'name', tags: ['description'] }],
    });
    assert.deepEqual(
      nonDesc.descriptionFieldName,
      'name',
      'descriptionFieldName returned `name` as the description field'
    );

    //@ts-expect-error
    let twoKeys = new DimensionMetadataModel(nullInjector, {
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

    //@ts-expect-error
    let noFields = new DimensionMetadataModel(nullInjector, {});
    assert.deepEqual(
      noFields.descriptionFieldName,
      'desc',
      'descriptionFieldName returns `desc` when there is no `fields` metadata prop'
    );

    //@ts-expect-error
    let noDesc = new DimensionMetadataModel(nullInjector, {});
    assert.deepEqual(
      noDesc.descriptionFieldName,
      'desc',
      'descriptionFieldName returns `desc` when there are no `description` tags'
    );
  });

  test('extended property', async function (assert) {
    //@ts-expect-error
    const extendedModel = new DimensionMetadataModel(nullInjector, {});
    const dimensionOne = new DimensionMetadataModel(
      {
        //@ts-expect-error - mock injector
        lookup(type, name) {
          assert.equal(type, 'service', 'service is looked up');
          assert.equal(name, 'navi-metadata', 'metadata service is looked up');
          return {
            findById() {
              return Promise.resolve(extendedModel);
            },
          };
        },
      },
      {
        id: 'dimensionOne',
        source: 'bardOne',
      }
    );

    const result = await dimensionOne.extended;
    assert.strictEqual(result, extendedModel, 'dimension model can fetch extended attributes');
  });

  test('cardinality', function (assert) {
    //@ts-expect-error
    const dimension = new DimensionMetadataModel(nullInjector, {
      cardinality: 'MEDIUM',
      type: 'field',
    });

    assert.equal(
      dimension.cardinality,
      'MEDIUM',
      'Dimension successfully gets its cardinality from its table when type of dimension is field'
    );

    //@ts-expect-error
    const dimension2 = new DimensionMetadataModel(nullInjector, {
      cardinality: 'MEDIUM',
      type: 'ref',
    });

    assert.strictEqual(
      dimension2.cardinality,
      'MEDIUM',
      'Dimension successfully gets its cardinality from its table when type of dimension is ref'
    );

    //@ts-expect-error
    const dimension3 = new DimensionMetadataModel(nullInjector, {
      cardinality: 'MEDIUM',
      type: 'formula',
    });

    assert.strictEqual(
      dimension3.cardinality,
      'MEDIUM',
      'Dimension successfully gets its cardinality from its table when type of dimension is formula'
    );
  });

  test('idFieldName', async function (assert) {
    assert.expect(4);

    //@ts-expect-error
    const TestDimension = new DimensionMetadataModel(nullInjector, {
      fields: [
        {
          name: 'identifier',
          tags: ['id'],
        },
      ],
    });

    assert.deepEqual(TestDimension.idFieldName, 'identifier', 'idFieldName returned `identifier` as the id field');

    //@ts-expect-error
    let noId = new DimensionMetadataModel(nullInjector, {
      fields: [{ name: 'name', tags: ['something'] }],
    });
    assert.deepEqual(noId.idFieldName, 'id', 'idFieldName returned `id` as the default id field name');

    //@ts-expect-error
    let twoKeys = new DimensionMetadataModel(nullInjector, {
      fields: [
        { name: 'name1', tags: ['id'] },
        { name: 'name2', tags: ['id'] },
      ],
    });
    assert.deepEqual(twoKeys.idFieldName, 'name1', 'idFieldName returns the first field tagged as `id`');

    //@ts-expect-error
    let noFields = new DimensionMetadataModel(nullInjector, {});
    assert.deepEqual(noFields.idFieldName, 'id', 'idFieldName returns `id` when there is no `fields` metadata prop');
  });
});

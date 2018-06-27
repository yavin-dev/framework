import { get } from '@ember/object';
import { module, test } from 'qunit';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';

let Payload,
    Dimension;

module('Unit | Metadata Model | Metric', function(hooks) {
  hooks.beforeEach(function() {
    Payload = {
      name: 'age',
      longName: 'Age',
      category: 'Audience',
      cardinality: 13,
      fields: [
        { name: 'id', description: 'description', tags: ['primaryKey', 'display'] },
        { name: 'desc', description: 'description', tags: ['description', 'display'] },
        { name: 'emptyTags', description: 'description', tags: [] },
        { name: 'missingTags', description: 'description' }
      ]
    };

    Dimension = DimensionMetadataModel.create(Payload);
  });

  test('factory has identifierField defined', function(assert) {
    assert.expect(1);

    assert.equal(get(DimensionMetadataModel, 'identifierField'),
      'name',
      'identifierField property is set to `name`');
  });

  test('it properly hydrates properties', function(assert) {
    assert.expect(5);

    assert.deepEqual(get(Dimension, 'name'),
      Payload.name,
      'name property is hydrated properly');

    assert.equal(get(Dimension, 'longName'),
      Payload.longName,
      'longName property was properly hydrated');

    assert.equal(get(Dimension, 'category'),
      Payload.category,
      'category property was properly hydrated');

    assert.equal(get(Dimension, 'cardinality'),
      Payload.cardinality,
      'cardinality property was properly hydrated');

    assert.deepEqual(get(Dimension, 'fields'),
      Payload.fields,
      'fields property was properly hydrated');
  });

  test('getTagForField', function(assert) {
    assert.expect(5);

    assert.deepEqual(Dimension.getTagsForField('id'),
      Payload.fields[0].tags,
      'getTagsForField returns the correct tags for `id` field');

    assert.deepEqual(Dimension.getTagsForField('emptyTags'),
      [],
      'getTagsForField returns an empty array for empty tags array');

    assert.deepEqual(Dimension.getTagsForField('missingTags'),
      [],
      'getTagsForField returns an empty array when tags array is missing');

    assert.deepEqual(Dimension.getTagsForField('missingField'),
      [],
      'getTagsForField returns an empty array when `fields` property is missing');

    assert.deepEqual(Dimension.getTagsForField(),
      [],
      'getTagsForField returns an empty array when field is undefined');
  });

  test('getFieldsForTag', function(assert) {
    assert.expect(5);

    assert.deepEqual(Dimension.getFieldsForTag('primaryKey'),
      [ Payload.fields[0] ],
      'getFieldsForTag returns the correct field for tag `primaryKey`');

    assert.deepEqual(Dimension.getFieldsForTag('description'),
      [ Payload.fields[1] ],
      'getFieldsForTag returns the correct field for tag `description`');

    assert.deepEqual(Dimension.getFieldsForTag('display'),
      [ Payload.fields[0], Payload.fields[1] ],
      'getFieldsForTag returns the correct fields for tag `display`');

    assert.deepEqual(Dimension.getFieldsForTag('missingTag'),
      [],
      'getFieldsForTag returns an empty array when tag is missing');

    assert.deepEqual(Dimension.getFieldsForTag(),
      [],
      'getFieldsForTag returns an empty array when tag is undefined');
  });

  test('primaryKeyFieldName', function(assert) {
    assert.expect(5);

    assert.deepEqual(Dimension.get('primaryKeyFieldName'),
      'id',
      'primaryKeyFieldName returned `id` as the primary key field');

    let nonId = DimensionMetadataModel.create({
      fields: [ { name: 'key', tags: ['primaryKey'] } ]
    });
    assert.deepEqual(nonId.get('primaryKeyFieldName'),
      'key',
      'primaryKeyFieldName returned `key` as the primary key field');

    let twoKeys = DimensionMetadataModel.create({
      fields: [
        { name: 'key1', tags: ['primaryKey'] },
        { name: 'key2', tags: ['primaryKey'] }
      ]
    });
    assert.deepEqual(twoKeys.get('primaryKeyFieldName'),
      'key1',
      'primaryKeyFieldName returns the first field tagged as `primaryKey`');

    let noFields = DimensionMetadataModel.create({});
    assert.deepEqual(noFields.get('primaryKeyFieldName'),
      'id',
      'primaryKeyFieldName returns `id` when there is no `fields` metadata prop');

    let noPriKey = DimensionMetadataModel.create({});
    assert.deepEqual(noPriKey.get('primaryKeyFieldName'),
      'id',
      'primaryKeyFieldName returns `id` when there are no `primaryKey` tags');
  });

  test('descriptionFieldName', function(assert) {
    assert.expect(5);

    assert.deepEqual(Dimension.get('descriptionFieldName'),
      'desc',
      'descriptionFieldName returned `desc` as the description field');

    let nonDesc = DimensionMetadataModel.create({
      fields: [ { name: 'name', tags: ['description'] } ]
    });
    assert.deepEqual(nonDesc.get('descriptionFieldName'),
      'name',
      'descriptionFieldName returned `name` as the description field');

    let twoKeys = DimensionMetadataModel.create({
      fields: [
        { name: 'name1', tags: ['description'] },
        { name: 'name2', tags: ['description'] }
      ]
    });
    assert.deepEqual(twoKeys.get('descriptionFieldName'),
      'name1',
      'descriptionFieldName returns the first field tagged as `description`');

    let noFields = DimensionMetadataModel.create({});
    assert.deepEqual(noFields.get('descriptionFieldName'),
      'desc',
      'descriptionFieldName returns `desc` when there is no `fields` metadata prop');

    let noDesc = DimensionMetadataModel.create({});
    assert.deepEqual(noDesc.get('descriptionFieldName'),
      'desc',
      'descriptionFieldName returns `desc` when there are no `description` tags');
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { DimensionOne, DimensionTwo, DimensionFive } from '../../../helpers/metadata-routes';

let Serializer;

module('Unit | Metadata | Dimension Serializer', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:metadata/dimension');
  });

  test('_normalizeDimensions', function(assert) {
    let testPayload = Object.assign({}, DimensionOne, {
      description: 'desc',
      datatype: 'text',
      storageStrategy: 'loaded',
      fields: []
    });
    let normalizedDimension = {
      id: 'dimensionOne',
      name: 'Dimension One',
      description: 'desc',
      category: 'categoryOne',
      valueType: 'text',
      source: 'dummy',
      storageStrategy: 'loaded',
      fields: []
    };

    assert.deepEqual(
      Serializer._normalizeDimensions([testPayload], 'dummy'),
      [normalizedDimension],
      '_normalizeDimensions can normalize a single dimension to the right shape'
    );

    testPayload = [
      testPayload,
      Object.assign({}, DimensionTwo, {
        description: 'desc2',
        datatype: 'date',
        storageStrategy: 'none'
      })
    ];
    let expectedDimensions = [
      normalizedDimension,
      {
        id: 'dimensionTwo',
        name: 'Dimension Two',
        description: 'desc2',
        category: 'categoryTwo',
        valueType: 'date',
        storageStrategy: 'none',
        fields: DimensionTwo.fields,
        source: 'dummy'
      }
    ];

    assert.deepEqual(
      Serializer._normalizeDimensions(testPayload, 'dummy'),
      expectedDimensions,
      'Multiple dimensions are normalized correctly'
    );
  });

  test('normalize', function(assert) {
    assert.strictEqual(
      Serializer.normalize({}, 'dummy'),
      undefined,
      'Serializer returns undefined for a payload with no dimensions key'
    );
    assert.strictEqual(Serializer.normalize(), undefined, 'Serializer returns undefined for a falsey payload');

    const source = 'dummy';
    let payload = {
        dimensions: [
          Object.assign({}, DimensionFive, {
            description: 'desc',
            datatype: 'text',
            storageStrategy: 'loaded'
          }),
          Object.assign({}, DimensionTwo, {
            description: 'description',
            datatype: 'date',
            storageStrategy: 'none'
          })
        ]
      },
      expectedDimensions = [
        {
          id: DimensionFive.name,
          name: DimensionFive.longName,
          category: DimensionFive.category,
          description: 'desc',
          valueType: 'text',
          storageStrategy: 'loaded',
          fields: DimensionFive.fields,
          source
        },
        {
          id: DimensionTwo.name,
          name: DimensionTwo.longName,
          category: DimensionTwo.category,
          description: 'description',
          valueType: 'date',
          storageStrategy: 'none',
          fields: DimensionTwo.fields,
          source
        }
      ];

    assert.deepEqual(
      Serializer.normalize(payload, source),
      expectedDimensions,
      'normalize successfully normalizes a payload with dimensions key'
    );
  });
});

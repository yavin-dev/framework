import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

const Payload = {
    source: 'dummy',
    tables: [
      {
        name: 'tableName',
        description: 'Table Description',
        longName: 'tableLongName',
        category: 'General',
        timeGrains: [
          {
            name: 'day',
            description: 'The tableName day grain',
            metrics: [
              {
                category: 'category',
                name: 'metricOne',
                longName: 'Metric One',
                uri: 'https://metric-one-url',
                type: 'number'
              },
              {
                category: 'category',
                name: 'metricTwo',
                longName: 'Metric Two',
                uri: 'https://metric-two-url',
                type: 'money'
              }
            ],
            retention: 'P24M',
            longName: 'Day',
            dimensions: [
              {
                category: 'categoryOne',
                name: 'dimensionOne',
                longName: 'Dimension One',
                uri: 'https://host:port/namespace/dimensions/dimensionOne',
                cardinality: '10'
              },
              {
                category: 'categoryTwo',
                name: 'dimensionTwo',
                longName: 'Dimension Two',
                uri: 'https://host:port/namespace/dimensions/dimensionTwo',
                cardinality: '5'
              }
            ]
          },
          {
            name: 'month',
            description: 'The tableName month grain',
            metrics: [
              {
                category: 'category',
                name: 'metricOne',
                longName: 'Metric One',
                uri: 'https://metric-one-url',
                type: 'number'
              },
              {
                category: 'category',
                name: 'metricTwo',
                longName: 'Metric Two',
                uri: 'https://metric-two-url',
                type: 'money'
              }
            ],
            retention: 'P24M',
            longName: 'MONTH',
            dimensions: [
              {
                category: 'categoryOne',
                name: 'dimensionOne',
                longName: 'Dimension One',
                uri: 'https://host:port/namespace/dimensions/dimensionOne',
                cardinality: '10'
              },
              {
                category: 'categoryTwo',
                name: 'dimensionTwo',
                longName: 'Dimension Two',
                uri: 'https://host:port/namespace/dimensions/dimensionTwo',
                cardinality: '5'
              }
            ]
          }
        ]
      }
    ]
  },
  // list of table objects, with table->timegrains->dimensions+metrics
  Tables = [
    {
      name: 'tableName',
      description: 'Table Description',
      longName: 'tableLongName',
      category: 'General',
      source: 'dummy',
      timeGrains: [
        {
          name: 'day',
          description: 'The tableName day grain',
          retention: 'P24M',
          longName: 'Day',
          metricIds: ['metricOne', 'metricTwo'],
          dimensionIds: ['dimensionOne', 'dimensionTwo']
        },
        {
          name: 'month',
          description: 'The tableName month grain',
          retention: 'P24M',
          longName: 'MONTH',
          metricIds: ['metricOne', 'metricTwo'],
          dimensionIds: ['dimensionOne', 'dimensionTwo']
        }
      ]
    }
  ],
  Dimensions = [
    {
      category: 'categoryOne',
      name: 'dimensionOne',
      longName: 'Dimension One',
      uri: 'https://host:port/namespace/dimensions/dimensionOne',
      cardinality: '10',
      partial: true,
      source: 'dummy'
    },
    {
      category: 'categoryTwo',
      name: 'dimensionTwo',
      longName: 'Dimension Two',
      uri: 'https://host:port/namespace/dimensions/dimensionTwo',
      cardinality: '5',
      partial: true,
      source: 'dummy'
    },
    {
      category: 'categoryOne',
      name: 'dimensionOne',
      longName: 'Dimension One',
      uri: 'https://host:port/namespace/dimensions/dimensionOne',
      cardinality: '10',
      partial: true,
      source: 'dummy'
    },
    {
      category: 'categoryTwo',
      name: 'dimensionTwo',
      longName: 'Dimension Two',
      uri: 'https://host:port/namespace/dimensions/dimensionTwo',
      cardinality: '5',
      partial: true,
      source: 'dummy'
    }
  ],
  Metrics = [
    {
      category: 'category',
      name: 'metricOne',
      longName: 'Metric One',
      type: 'metric',
      uri: 'https://metric-one-url',
      valueType: 'number',
      partial: true,
      source: 'dummy'
    },
    {
      category: 'category',
      name: 'metricTwo',
      longName: 'Metric Two',
      type: 'metric',
      uri: 'https://metric-two-url',
      valueType: 'money',
      partial: true,
      source: 'dummy'
    },
    {
      category: 'category',
      name: 'metricOne',
      longName: 'Metric One',
      type: 'metric',
      uri: 'https://metric-one-url',
      valueType: 'number',
      partial: true,
      source: 'dummy'
    },
    {
      category: 'category',
      name: 'metricTwo',
      longName: 'Metric Two',
      type: 'metric',
      uri: 'https://metric-two-url',
      valueType: 'money',
      partial: true,
      source: 'dummy'
    }
  ];

let Serializer;

module('Unit | Bard Metadata Serializer', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:bard-metadata');
  });

  test('normalize', function(assert) {
    assert.expect(3);

    assert.deepEqual(Serializer.normalize(Payload).metrics, Metrics, 'Correctly parsed metric objects from payload');

    assert.deepEqual(
      Serializer.normalize(Payload).dimensions,
      Dimensions,
      'Correctly parsed dimension objects from payload'
    );

    assert.deepEqual(Serializer.normalize(Payload).tables, Tables, 'Correctly parsed table objects from payload');
  });
});

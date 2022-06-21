import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type ElideMetadataSerializer from 'navi-data/serializers/metadata/elide';
import { TestContext } from 'ember-test-helpers';
import config from 'ember-get-config';
import type {
  TablePayload,
  MetricNode,
  Connection,
  DimensionNode,
  TimeDimensionNode,
  TimeDimensionGrainNode,
} from 'navi-data/serializers/metadata/elide';
import { DataType } from '@yavin/client/models/metadata/function-parameter';
import { capitalize } from 'lodash-es';
import TableMetadataModel, { TableMetadataPayload } from '@yavin/client/models/metadata/table';
import TimeDimensionMetadataModel, { TimeDimensionMetadataPayload } from '@yavin/client/models/metadata/time-dimension';
import ColumnFunctionMetadataModel, {
  ColumnFunctionMetadataPayload,
} from '@yavin/client/models/metadata/column-function';
import MetricMetadataModel, { MetricMetadataPayload } from '@yavin/client/models/metadata/metric';
import ElideDimensionMetadataModel, {
  ElideDimensionMetadataPayload,
  ValueSourceType,
} from '@yavin/client/models/metadata/elide/dimension';

let Serializer: ElideMetadataSerializer;

module('Unit | Serializer | metadata/elide', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    Serializer = this.owner.lookup('serializer:metadata/elide');
  });

  test('normalize', function (assert) {
    const tableConnectionPayload: TablePayload = {
      data: {
        table: {
          edges: [
            {
              node: {
                id: 'tableA',
                name: 'Table A',
                friendlyName: 'Friendly Table A',
                description: 'Table A',
                category: 'cat1',
                cardinality: 'SMALL',
                isFact: true,
                namespace: {
                  edges: [
                    {
                      node: {
                        id: 'default',
                        name: 'default',
                        friendlyName: 'default',
                        description: 'Default Namespace',
                      },
                      cursor: '',
                    },
                  ],
                  pageInfo: [],
                },
                metrics: {
                  edges: [
                    {
                      node: {
                        id: 'tableA.m1',
                        name: 'M1',
                        friendlyName: 'Friendly M1',
                        description: 'Table A Metric 1',
                        category: 'cat1',
                        valueType: 'NUMBER',
                        tags: ['IMPORTANT'],
                        defaultFormat: 'NONE',
                        columnType: 'field',
                        expression: '',
                        arguments: { edges: [] },
                      },
                      cursor: '',
                    },
                  ],
                  pageInfo: [],
                },
                dimensions: {
                  edges: [
                    {
                      node: {
                        id: 'tableA.d1',
                        name: 'D1',
                        friendlyName: 'Friendly D1',
                        description: 'Table A Dimension 1',
                        cardinality: 'TINY',
                        category: 'cat1',
                        valueType: 'TEXT',
                        tags: ['IMPORTANT'],
                        columnType: 'field',
                        expression: '',
                        valueSourceType: ValueSourceType.NONE,
                        tableSource: null,
                        values: [],
                        arguments: { edges: [] },
                      },
                      cursor: '',
                    },
                    {
                      node: {
                        id: 'tableA.d2',
                        name: 'D2',
                        friendlyName: 'Friendly D2',
                        description: 'Table A Dimension 2',
                        cardinality: 'MEDIUM',
                        category: 'cat1',
                        valueType: 'TEXT',
                        tags: ['IMPORTANT'],
                        columnType: 'field',
                        expression: '',
                        valueSourceType: ValueSourceType.NONE,
                        tableSource: null,
                        values: [],
                        arguments: { edges: [] },
                      },
                      cursor: '',
                    },
                  ],
                  pageInfo: {},
                },
                timeDimensions: {
                  edges: [
                    {
                      node: {
                        id: 'tableA.td1',
                        name: 'TD1',
                        friendlyName: 'Friendly TD1',
                        description: 'Table A Time Dimension 1',
                        cardinality: 'UNKNOWN',
                        category: 'cat1',
                        valueType: 'DATE',
                        tags: ['IMPORTANT'],
                        supportedGrains: {
                          edges: [
                            { node: { id: 'day', grain: 'DAY', expression: '' }, cursor: '' },
                            { node: { id: 'week', grain: 'WEEK', expression: '' }, cursor: '' },
                          ],
                          pageInfo: {},
                        },
                        timeZone: 'UTC',
                        columnType: 'field',
                        expression: '',
                        valueSourceType: ValueSourceType.NONE,
                        tableSource: null,
                        values: [],
                        arguments: { edges: [] },
                      },
                      cursor: '',
                    },
                  ],
                  pageInfo: {},
                },
              },
              cursor: '',
            },
            {
              node: {
                id: 'tableB',
                name: 'Table B',
                friendlyName: 'Friendly Table B',
                description: 'Table B',
                category: 'cat2',
                cardinality: 'MEDIUM',
                isFact: true,
                namespace: {
                  edges: [
                    {
                      node: {
                        id: 'default',
                        name: 'default',
                        friendlyName: 'default',
                        description: 'Default Namespace',
                      },
                      cursor: '',
                    },
                  ],
                  pageInfo: [],
                },
                metrics: {
                  edges: [
                    {
                      node: {
                        id: 'tableB.m2',
                        name: 'M2',
                        friendlyName: 'Friendly M2',
                        description: 'Table B Metric 2',
                        category: 'cat2',
                        valueType: 'NUMBER',
                        tags: ['IMPORTANT'],
                        defaultFormat: 'NONE',
                        columnType: 'field',
                        expression: '',
                        arguments: { edges: [] },
                      },
                      cursor: '',
                    },
                    {
                      node: {
                        id: 'tableB.m3',
                        name: 'M3',
                        friendlyName: 'Friendly M3',
                        description: 'Table B Metric 3',
                        category: 'cat2',
                        valueType: 'NUMBER',
                        tags: ['IMPORTANT'],
                        defaultFormat: 'NONE',
                        columnType: 'field',
                        expression: '',
                        arguments: { edges: [] },
                      },
                      cursor: '',
                    },
                  ],
                  pageInfo: {},
                },
                dimensions: {
                  edges: [
                    {
                      node: {
                        id: 'tableB.d1',
                        name: 'D1',
                        friendlyName: 'Friendly D1',
                        description: 'Table B Dimension 1',
                        cardinality: 'SMALL',
                        category: 'cat2',
                        valueType: 'TEXT',
                        tags: ['IMPORTANT'],
                        columnType: 'field',
                        expression: '',
                        valueSourceType: ValueSourceType.NONE,
                        tableSource: null,
                        values: [],
                        arguments: { edges: [] },
                      },
                      cursor: '',
                    },
                    {
                      node: {
                        id: 'tableB.d2',
                        name: 'D2',
                        friendlyName: 'Friendly D2',
                        description: 'Table B Dimension 2',
                        cardinality: 'LARGE',
                        category: 'cat2',
                        valueType: 'TEXT',
                        tags: ['IMPORTANT'],
                        columnType: 'field',
                        expression: '',
                        valueSourceType: ValueSourceType.NONE,
                        tableSource: null,
                        values: [],
                        arguments: { edges: [] },
                      },
                      cursor: '',
                    },
                  ],
                  pageInfo: {},
                },
                timeDimensions: {
                  edges: [],
                  pageInfo: {},
                },
              },
              cursor: '',
            },
          ],
          pageInfo: {},
        },
      },
    };

    const expectedTablePayloads: TableMetadataPayload[] = [
      {
        id: 'tableA',
        name: 'Friendly Table A',
        description: 'Table A',
        category: 'cat1',
        cardinality: 'SMALL',
        isFact: true,
        metricIds: ['tableA.m1'],
        dimensionIds: ['tableA.d1', 'tableA.d2'],
        timeDimensionIds: ['tableA.td1'],
        requestConstraintIds: [],
        source: 'bardOne',
      },
      {
        id: 'tableB',
        name: 'Friendly Table B',
        description: 'Table B',
        category: 'cat2',
        cardinality: 'MEDIUM',
        isFact: true,
        metricIds: ['tableB.m2', 'tableB.m3'],
        dimensionIds: ['tableB.d1', 'tableB.d2'],
        timeDimensionIds: [],
        requestConstraintIds: [],
        source: 'bardOne',
      },
    ];

    const expectedMetricPayloads: MetricMetadataPayload[] = [
      {
        id: 'tableA.m1',
        name: 'Friendly M1',
        description: 'Table A Metric 1',
        category: 'cat1',
        valueType: 'NUMBER',
        tags: ['IMPORTANT'],
        defaultFormat: 'NONE',
        type: 'field',
        isSortable: true,
        expression: '',
        source: 'bardOne',
        tableId: 'tableA',
        columnFunctionId: undefined,
      },
      {
        id: 'tableB.m2',
        name: 'Friendly M2',
        description: 'Table B Metric 2',
        category: 'cat2',
        valueType: 'NUMBER',
        tags: ['IMPORTANT'],
        defaultFormat: 'NONE',
        type: 'field',
        isSortable: true,
        expression: '',
        tableId: 'tableB',
        source: 'bardOne',
        columnFunctionId: undefined,
      },
      {
        id: 'tableB.m3',
        name: 'Friendly M3',
        description: 'Table B Metric 3',
        category: 'cat2',
        valueType: 'NUMBER',
        tags: ['IMPORTANT'],
        defaultFormat: 'NONE',
        type: 'field',
        isSortable: true,
        expression: '',
        tableId: 'tableB',
        source: 'bardOne',
        columnFunctionId: undefined,
      },
    ];

    const expectedDimensionPayloads: ElideDimensionMetadataPayload[] = [
      {
        id: 'tableA.d1',
        name: 'Friendly D1',
        description: 'Table A Dimension 1',
        cardinality: 'SMALL',
        category: 'cat1',
        valueType: 'TEXT',
        tags: ['IMPORTANT'],
        type: 'field',
        isSortable: true,
        expression: '',
        source: 'bardOne',
        tableId: 'tableA',
        valueSourceType: ValueSourceType.NONE,
        tableSource: undefined,
        values: [],
        columnFunctionId: undefined,
      },
      {
        id: 'tableA.d2',
        name: 'Friendly D2',
        description: 'Table A Dimension 2',
        cardinality: 'MEDIUM',
        category: 'cat1',
        valueType: 'TEXT',
        tags: ['IMPORTANT'],
        type: 'field',
        isSortable: true,
        expression: '',
        source: 'bardOne',
        tableId: 'tableA',
        valueSourceType: ValueSourceType.NONE,
        tableSource: undefined,
        values: [],
        columnFunctionId: undefined,
      },
      {
        id: 'tableB.d1',
        name: 'Friendly D1',
        description: 'Table B Dimension 1',
        cardinality: 'SMALL',
        category: 'cat2',
        valueType: 'TEXT',
        tags: ['IMPORTANT'],
        type: 'field',
        isSortable: true,
        expression: '',
        source: 'bardOne',
        tableId: 'tableB',
        valueSourceType: ValueSourceType.NONE,
        tableSource: undefined,
        values: [],
        columnFunctionId: undefined,
      },
      {
        id: 'tableB.d2',
        name: 'Friendly D2',
        description: 'Table B Dimension 2',
        cardinality: 'LARGE',
        category: 'cat2',
        valueType: 'TEXT',
        tags: ['IMPORTANT'],
        type: 'field',
        isSortable: true,
        expression: '',
        source: 'bardOne',
        tableId: 'tableB',
        valueSourceType: ValueSourceType.NONE,
        tableSource: undefined,
        values: [],
        columnFunctionId: undefined,
      },
    ];

    const expectedTimeDimensionPayloads: TimeDimensionMetadataPayload[] = [
      {
        id: 'tableA.td1',
        name: 'Friendly TD1',
        description: 'Table A Time Dimension 1',
        category: 'cat1',
        valueType: 'DATE',
        tags: ['IMPORTANT'],
        type: 'field',
        isSortable: true,
        expression: '',
        supportedGrains: [
          { id: 'day', grain: 'DAY', expression: '' },
          { id: 'week', grain: 'WEEK', expression: '' },
        ],
        timeZone: 'UTC',
        source: 'bardOne',
        tableId: 'tableA',
        valueSourceType: ValueSourceType.NONE,
        columnFunctionId: 'normalizer-generated:timeGrain(column=tableA.td1;grains=day,week)',
      },
    ];

    const expectedColumnFunctionsPayloads: ColumnFunctionMetadataPayload[] = [
      {
        id: 'normalizer-generated:timeGrain(column=tableA.td1;grains=day,week)',
        name: 'Time Grain',
        description: 'Time Grain',
        source: 'bardOne',
        _parametersPayload: [
          {
            _localValues: [
              {
                id: 'day',
                description: 'Day',
                name: 'day',
              },
              {
                id: 'week',
                description: 'Week',
                name: 'week',
              },
            ],
            defaultValue: 'day',
            description: 'The time grain to group dates by',
            valueSourceType: ValueSourceType.ENUM,
            id: 'grain',
            name: 'Time Grain',
            source: 'bardOne',
            valueType: DataType.TEXT,
          },
        ],
      },
    ];

    const injector = this.owner.lookup('service:client-injector');
    assert.deepEqual(
      Serializer.normalize('everything', tableConnectionPayload, 'bardOne'),
      {
        tables: expectedTablePayloads.map((p) => new TableMetadataModel(injector, p)),
        metrics: expectedMetricPayloads.map((p) => new MetricMetadataModel(injector, p)),
        dimensions: expectedDimensionPayloads.map((p) => new ElideDimensionMetadataModel(injector, p)),
        timeDimensions: expectedTimeDimensionPayloads.map((p) => new TimeDimensionMetadataModel(injector, p)),
        columnFunctions: expectedColumnFunctionsPayloads.map((p) => new ColumnFunctionMetadataModel(injector, p)),
        requestConstraints: [],
      },
      'Table 0'
    );
  });

  test('normalize - error', function (assert) {
    const message = 'Bad Request';
    const tableConnectionPayload: TablePayload = {
      error: { message },
    };
    assert.throws(
      () => Serializer.normalize('everything', tableConnectionPayload, 'bardOne'),
      new RegExp(message),
      'it throws an error if `error` field is present'
    );
  });

  test('_normalizeTableMetrics', function (assert) {
    const tableId = 'siteAnalytics';
    const source = 'myApi';
    const metricConnectionPayload: Connection<MetricNode> = {
      edges: [
        {
          node: {
            id: 'clicks',
            name: 'Clicks',
            friendlyName: 'Friendly Clicks',
            description: 'Clicks',
            category: 'userMetrics',
            valueType: 'NUMBER',
            tags: ['IMPORTANT'],
            defaultFormat: 'NONE',
            columnType: 'field',
            expression: '',
            arguments: {
              edges: [
                {
                  node: {
                    id: 'argId',
                    name: 'argName',
                    description: 'argDesc',
                    type: DataType.TEXT,
                    values: [],
                    valueSourceType: ValueSourceType.TABLE,
                    tableSource: {
                      edges: [
                        {
                          node: {
                            suggestionColumns: { edges: [] },
                            valueSource: {
                              edges: [
                                {
                                  node: {
                                    id: 'argColumnId',
                                  },
                                  cursor: '',
                                },
                              ],
                            },
                          },
                          cursor: '',
                        },
                      ],
                    },
                    defaultValue: 'a default value',
                  },
                  cursor: '',
                },
              ],
            },
          },
          cursor: '',
        },
        {
          node: {
            id: 'impressions',
            name: 'Impressions',
            friendlyName: 'Friendly Impressions',
            description: 'Impressions',
            category: 'userMetrics',
            valueType: 'NUMBER',
            tags: ['DISPLAY'],
            defaultFormat: 'NONE',
            columnType: 'field',
            expression: '',
            arguments: {
              edges: [
                {
                  node: {
                    id: 'arg-id',
                    name: 'arg-name',
                    description: 'arg-description',
                    type: DataType.INTEGER,
                    values: ['1', '2'],
                    valueSourceType: ValueSourceType.ENUM,
                    tableSource: { edges: [] },
                    defaultValue: '1',
                  },
                  cursor: '',
                },
              ],
            },
          },
          cursor: '',
        },
      ],
      pageInfo: {},
    };

    const expectedMetricPayloads: MetricMetadataPayload[] = [
      {
        id: 'clicks',
        name: 'Friendly Clicks',
        description: 'Clicks',
        category: 'userMetrics',
        valueType: 'NUMBER',
        tags: ['IMPORTANT'],
        defaultFormat: 'NONE',
        source,
        tableId,
        type: 'field',
        isSortable: true,
        expression: '',
        columnFunctionId: 'normalizer-generated:elide-myApi:column=clicks',
      },
      {
        id: 'impressions',
        name: 'Friendly Impressions',
        description: 'Impressions',
        category: 'userMetrics',
        valueType: 'NUMBER',
        tags: ['DISPLAY'],
        defaultFormat: 'NONE',
        source,
        tableId,
        type: 'field',
        isSortable: true,
        expression: '',
        columnFunctionId: 'normalizer-generated:elide-myApi:column=impressions',
      },
    ];

    const expectedFunctionPayloads: ColumnFunctionMetadataPayload[] = [
      {
        id: 'normalizer-generated:elide-myApi:column=clicks',
        name: 'Column Arguments',
        description: 'Column Arguments',
        source,
        _parametersPayload: [
          {
            id: 'argName',
            name: 'argName',
            description: 'argDesc',
            source,
            valueSourceType: ValueSourceType.TABLE,
            valueType: DataType.TEXT,
            tableSource: {
              valueSource: 'argColumnId',
            },
            defaultValue: 'a default value',
            _localValues: [],
          },
        ],
      },
      {
        id: 'normalizer-generated:elide-myApi:column=impressions',
        name: 'Column Arguments',
        description: 'Column Arguments',
        source,
        _parametersPayload: [
          {
            id: 'arg-name',
            name: 'arg-name',
            description: 'arg-description',
            source,
            valueSourceType: ValueSourceType.ENUM,
            valueType: DataType.INTEGER,
            tableSource: undefined,
            defaultValue: '1',
            _localValues: [
              { id: '1', name: '1' },
              { id: '2', name: '2' },
            ],
          },
        ],
      },
    ];

    const metrics = Serializer._normalizeTableMetrics(metricConnectionPayload, tableId, source);
    const metricModels = metrics.map((m) => m.metricModel);
    const columnFunctions = metrics.map((m) => m.columnFunction);

    assert.deepEqual(
      metricModels,
      expectedMetricPayloads.map((p) => new MetricMetadataModel(this.owner.lookup('service:client-injector'), p)),
      'metric models are normalized properly'
    );

    assert.deepEqual(
      columnFunctions,
      [
        ...expectedFunctionPayloads.map(
          (p) => new ColumnFunctionMetadataModel(this.owner.lookup('service:client-injector'), p)
        ),
      ],
      'metric column functions are normalized properly'
    );

    assert.deepEqual(
      Serializer._normalizeTableMetrics({ edges: [], pageInfo: {} }, tableId, source),
      [],
      'A connection with no edges returns an empty array'
    );
  });

  test('_normalizeTableDimensions', function (assert) {
    const tableId = 'siteAnalytics';
    const source = 'myApi';
    const dimensionConnectionPayload: Connection<DimensionNode> = {
      edges: [
        {
          node: {
            id: 'age',
            name: 'Age',
            friendlyName: 'Friendly Age',
            description: 'User Age',
            cardinality: 'UNKNOWN',
            category: 'userDimensions',
            valueType: 'TEXT',
            tags: ['IMPORTANT'],
            columnType: 'field',
            expression: '',
            valueSourceType: ValueSourceType.NONE,
            tableSource: {
              pageInfo: null,
              edges: [
                {
                  cursor: '',
                  node: {
                    valueSource: {
                      pageInfo: null,
                      edges: [
                        {
                          cursor: '',
                          node: {
                            id: 'somewhere.age_value',
                          },
                        },
                      ],
                    },
                    suggestionColumns: {
                      pageInfo: null,
                      edges: [
                        {
                          cursor: '',
                          node: {
                            id: 'somewhere.age_description',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
            values: [],
            arguments: { edges: [] },
          },
          cursor: '',
        },
        {
          node: {
            id: 'gender',
            name: 'Gender',
            friendlyName: 'Friendly Gender',
            description: 'User Gender',
            cardinality: 'TINY',
            category: 'userDimensions',
            valueType: 'TEXT',
            tags: ['DISPLAY'],
            columnType: 'field',
            expression: '',
            valueSourceType: ValueSourceType.NONE,
            tableSource: null,
            values: [],
            arguments: {
              edges: [
                {
                  node: {
                    id: 'arg-id',
                    name: 'arg-name',
                    description: 'arg-description',
                    type: DataType.INTEGER,
                    values: ['1', '2'],
                    valueSourceType: ValueSourceType.ENUM,
                    tableSource: { edges: [] },
                    defaultValue: '1',
                  },
                  cursor: '',
                },
              ],
            },
          },
          cursor: '',
        },
      ],
      pageInfo: [],
    };

    const expectedDimensionPayloads: ElideDimensionMetadataPayload[] = [
      {
        id: 'age',
        name: 'Friendly Age',
        description: 'User Age',
        category: 'userDimensions',
        valueType: 'TEXT',
        tags: ['IMPORTANT'],
        source,
        tableId,
        type: 'field',
        isSortable: true,
        expression: '',
        valueSourceType: ValueSourceType.NONE,
        tableSource: {
          valueSource: 'somewhere.age_value',
          suggestionColumns: [{ id: 'somewhere.age_description' }],
        },
        values: [],
        columnFunctionId: undefined,
      },
      {
        id: 'gender',
        name: 'Friendly Gender',
        description: 'User Gender',
        cardinality: 'SMALL',
        category: 'userDimensions',
        valueType: 'TEXT',
        tags: ['DISPLAY'],
        source,
        tableId,
        type: 'field',
        isSortable: true,
        expression: '',
        valueSourceType: ValueSourceType.NONE,
        tableSource: undefined,
        values: [],
        columnFunctionId: 'normalizer-generated:elide-myApi:column=gender',
      },
    ];

    const expectedFunctionPayloads: ColumnFunctionMetadataPayload[] = [
      {
        id: 'normalizer-generated:elide-myApi:column=gender',
        name: 'Column Arguments',
        description: 'Column Arguments',
        source,
        _parametersPayload: [
          {
            id: 'arg-name',
            name: 'arg-name',
            description: 'arg-description',
            source,
            valueSourceType: ValueSourceType.ENUM,
            valueType: DataType.INTEGER,
            tableSource: undefined,
            defaultValue: '1',
            _localValues: [
              { id: '1', name: '1' },
              { id: '2', name: '2' },
            ],
          },
        ],
      },
    ];

    const dimensions = Serializer._normalizeTableDimensions(dimensionConnectionPayload, tableId, source);
    const dimensionModels = dimensions.map((d) => d.dimensionModel);
    const columnFunctions = dimensions.map((d) => d.columnFunction);

    assert.deepEqual(
      dimensionModels,
      expectedDimensionPayloads.map(
        (p) => new ElideDimensionMetadataModel(this.owner.lookup('service:client-injector'), p)
      ),
      'dimension models are normalized properly'
    );

    assert.deepEqual(
      columnFunctions,
      [
        null,
        ...expectedFunctionPayloads.map(
          (p) => new ColumnFunctionMetadataModel(this.owner.lookup('service:client-injector'), p)
        ),
      ],
      'dimension column functions are normalized properly'
    );

    assert.deepEqual(
      Serializer._normalizeTableDimensions({ edges: [], pageInfo: {} }, tableId, source),
      [],
      'A connection with no edges returns an empty array'
    );
  });

  test('_normalizeTableTimeDimensions', function (assert) {
    const tableId = 'siteAnalytics';
    const source = 'myApi';
    const timeDimensionPayload: Connection<TimeDimensionNode> = {
      edges: [
        {
          node: {
            id: 'userSignupDate',
            name: 'User Signup Date',
            friendlyName: 'Friendly User Signup Date',
            description: 'Date that the user signed up',
            cardinality: 'UNKNOWN',
            category: 'userDimensions',
            valueType: 'DATE',
            tags: ['DISPLAY'],
            supportedGrains: {
              edges: [
                { node: { id: 'day', grain: 'DAY', expression: '' }, cursor: '' },
                { node: { id: 'week', grain: 'WEEK', expression: '' }, cursor: '' },
                { node: { id: 'month', grain: 'MONTH', expression: '' }, cursor: '' },
              ],
              pageInfo: {},
            },
            timeZone: 'PST',
            columnType: 'field',
            expression: '',
            valueSourceType: ValueSourceType.NONE,
            tableSource: null,
            values: [],
            arguments: { edges: [] },
          },
          cursor: '',
        },
        {
          node: {
            id: 'orderMonth',
            name: 'Order Month',
            friendlyName: 'Friendly Order Month',
            description: 'Month an order was placed',
            cardinality: 'UNKNOWN',
            category: 'userDimensions',
            valueType: 'DATE',
            tags: ['DISPLAY'],
            supportedGrains: {
              edges: [{ node: { id: 'month', grain: 'MONTH', expression: '' }, cursor: '' }],
              pageInfo: [],
            },
            timeZone: 'CST',
            columnType: 'field',
            expression: '',
            valueSourceType: ValueSourceType.NONE,
            tableSource: null,
            values: [],
            arguments: { edges: [] },
          },
          cursor: '',
        },
      ],
      pageInfo: {},
    };

    const oldDefaultGrain = config.navi.defaultTimeGrain;
    config.navi.defaultTimeGrain = 'day';

    const expected: { timeDimension: TimeDimensionMetadataPayload; columnFunction: ColumnFunctionMetadataPayload }[] = [
      {
        timeDimension: {
          id: 'userSignupDate',
          name: 'Friendly User Signup Date',
          description: 'Date that the user signed up',
          category: 'userDimensions',
          valueType: 'DATE',
          tags: ['DISPLAY'],
          supportedGrains: [
            { id: 'day', grain: 'DAY', expression: '' },
            { id: 'week', grain: 'WEEK', expression: '' },
            { id: 'month', grain: 'MONTH', expression: '' },
          ],
          timeZone: 'PST',
          source,
          tableId,
          type: 'field',
          isSortable: true,
          expression: '',
          valueSourceType: ValueSourceType.NONE,
          columnFunctionId: 'normalizer-generated:timeGrain(column=userSignupDate;grains=day,month,week)',
        },
        columnFunction: {
          id: 'normalizer-generated:timeGrain(column=userSignupDate;grains=day,month,week)',
          name: 'Time Grain',
          source,
          description: 'Time Grain',
          _parametersPayload: [
            {
              id: 'grain',
              name: 'Time Grain',
              description: 'The time grain to group dates by',
              source,
              valueType: DataType.TEXT,
              valueSourceType: ValueSourceType.ENUM,
              defaultValue: 'day',
              _localValues: [
                {
                  id: 'day',
                  description: 'Day',
                  name: 'day',
                },
                {
                  id: 'week',
                  description: 'Week',
                  name: 'week',
                },
                {
                  id: 'month',
                  description: 'Month',
                  name: 'month',
                },
              ],
            },
          ],
        },
      },
      {
        timeDimension: {
          id: 'orderMonth',
          name: 'Friendly Order Month',
          description: 'Month an order was placed',
          category: 'userDimensions',
          valueType: 'DATE',
          tags: ['DISPLAY'],
          supportedGrains: [{ id: 'month', grain: 'MONTH', expression: '' }],
          timeZone: 'CST',
          source,
          tableId,
          type: 'field',
          isSortable: true,
          expression: '',
          valueSourceType: ValueSourceType.NONE,
          columnFunctionId: 'normalizer-generated:timeGrain(column=orderMonth;grains=month)',
        },
        columnFunction: {
          id: 'normalizer-generated:timeGrain(column=orderMonth;grains=month)',
          name: 'Time Grain',
          source,
          description: 'Time Grain',
          _parametersPayload: [
            {
              id: 'grain',
              name: 'Time Grain',
              description: 'The time grain to group dates by',
              source,
              valueType: DataType.TEXT,
              valueSourceType: ValueSourceType.ENUM,
              defaultValue: 'month',
              _localValues: [
                {
                  id: 'month',
                  description: 'Month',
                  name: 'month',
                },
              ],
            },
          ],
        },
      },
    ];

    assert.deepEqual(
      Serializer._normalizeTableTimeDimensions(timeDimensionPayload, tableId, source),
      expected.map(({ timeDimension, columnFunction }) => ({
        timeDimension: new TimeDimensionMetadataModel(this.owner.lookup('service:client-injector'), timeDimension),
        columnFunction: new ColumnFunctionMetadataModel(this.owner.lookup('service:client-injector'), columnFunction),
      })),
      'Time Dimension connection payload is normalized properly for a table'
    );

    config.navi.defaultTimeGrain = oldDefaultGrain;

    assert.deepEqual(
      Serializer._normalizeTableTimeDimensions({ edges: [], pageInfo: {} }, tableId, source),
      [],
      'A connection with no edges returns an empty array'
    );
  });

  test('createTimeGrainColumnFunction', function (assert) {
    const timeDimensionId = 'wayTooPersonalTable.userBirthday';
    const grainNodes: TimeDimensionGrainNode[] = [
      {
        id: `${timeDimensionId}.day`,
        grain: 'DAY',
        expression: 'foo',
      },
      {
        id: `${timeDimensionId}.month`,
        grain: 'MONTH',
        expression: 'foo',
      },
      {
        id: `${timeDimensionId}.year`,
        grain: 'YEAR',
        expression: 'foo',
      },
    ];
    const dataSource = 'superInvasive';

    assert.deepEqual(
      Serializer['createTimeGrainColumnFunction'](timeDimensionId, grainNodes, dataSource),
      {
        id: `normalizer-generated:timeGrain(column=${timeDimensionId};grains=day,month,year)`,
        name: 'Time Grain',
        source: 'superInvasive',
        description: 'Time Grain',
        _parametersPayload: [
          {
            id: 'grain',
            name: 'Time Grain',
            description: 'The time grain to group dates by',
            source: dataSource,
            valueType: DataType.TEXT,
            valueSourceType: ValueSourceType.ENUM,
            defaultValue: 'day',
            _localValues: grainNodes.map((grain) => {
              const grainName = grain.grain.toLowerCase();
              return {
                id: grainName,
                description: capitalize(grainName),
                name: grainName,
              };
            }),
          },
        ],
      },
      'Column function is generated properly'
    );
  });
});

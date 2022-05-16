/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviMetadataSerializer from './base';
import config from 'ember-get-config';
import CARDINALITY_SIZES from '@yavin/client/utils/enums/cardinality-sizes';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import { upperFirst } from 'lodash-es';
import { DataType } from 'navi-data/models/metadata/function-parameter';
import type { FunctionParameterMetadataPayload } from 'navi-data/models/metadata/function-parameter';
import type { Cardinality } from '@yavin/client/utils/enums/cardinality-sizes';
import type { RawColumnType } from '../../models/metadata/column';
import type { TableMetadataPayload } from '../../models/metadata/table';
import type MetricMetadataModel from '../../models/metadata/metric';
import type { MetricMetadataPayload } from '../../models/metadata/metric';
import type DimensionMetadataModel from '../../models/metadata/dimension';
import type TimeDimensionMetadataModel from '../../models/metadata/time-dimension';
import type { TimeDimensionMetadataPayload } from '../../models/metadata/time-dimension';
import type ColumnFunctionMetadataModel from '../../models/metadata/column-function';
import type { ColumnFunctionMetadataPayload } from '../../models/metadata/column-function';
import type { MetadataModelMap, EverythingMetadataPayload } from './base';
import type ElideDimensionMetadataModel from 'navi-data/models/metadata/elide/dimension';
import { ElideDimensionMetadataPayload, ValueSourceType } from 'navi-data/models/metadata/elide/dimension';
import type { Factory } from 'navi-data/models/native-with-create';
import type { Grain } from 'navi-data/utils/date';
import { TableSource } from '../../models/metadata/dimension';

type Edge<T> = {
  node: T;
  cursor: string;
};
export type Connection<T> = {
  edges: Edge<T>[];
  pageInfo?: TODO;
};
type ElideCardinality = Uppercase<'unknown' | 'tiny' | 'small' | 'medium' | 'large' | 'huge'>;
type ColumnNode = {
  id: string;
  name: string;
  friendlyName: string;
  description: string;
  category: string;
  valueType: string;
  tags: string[];
  columnType: RawColumnType;
  expression: string;
  arguments: Connection<ElideArgument>;
};

export type MetricNode = ColumnNode & { defaultFormat: string };

type ElideArgument = {
  id: string;
  name: string;
  description: string;
  type: DataType;
  values: string[];
  valueSourceType: ValueSourceType;
  tableSource: Connection<ElideTableSource>;
  defaultValue: string;
};

export type ElideTableSource = {
  suggestionColumns: Connection<Partial<DimensionNode>>;
  valueSource: Connection<Partial<DimensionNode>>;
};

export type DimensionNode = ColumnNode & {
  cardinality: ElideCardinality;
  valueSourceType: ValueSourceType;
  tableSource: Connection<ElideTableSource> | null;
  values: string[];
};

export type TimeDimensionNode = DimensionNode & {
  supportedGrains: Connection<TimeDimensionGrainNode>;
  timeZone: string;
};
export type TimeDimensionGrainNode = {
  id: string;
  expression: string;
  grain: string;
};

export type NamespaceNode = {
  id: string;
  name: string;
  friendlyName: string;
  description: string;
};

type TableNode = {
  id: string;
  name: string;
  friendlyName: string;
  description: string;
  category: string;
  cardinality: ElideCardinality;
  isFact: boolean;
  namespace: Connection<NamespaceNode>;
  metrics: Connection<MetricNode>;
  dimensions: Connection<DimensionNode>;
  timeDimensions: Connection<TimeDimensionNode>;
};

export interface TablePayload {
  table: Connection<TableNode>;
}

function isPresent<T>(t: T | undefined | null | void): t is T {
  return t !== undefined && t !== null;
}

export default class ElideMetadataSerializer extends NaviMetadataSerializer {
  private namespace = 'normalizer-generated';

  private elideDimensionFactory = getOwner(this).factoryFor('model:metadata/elide/dimension') as Factory<
    typeof ElideDimensionMetadataModel
  >;

  protected createDimensionModel(payload: ElideDimensionMetadataPayload): DimensionMetadataModel {
    return this.elideDimensionFactory.create(payload);
  }

  /**
   * Transform the elide metadata into a shape that our internal data models can use
   * @private
   * @method _normalizeTableConnection - normalizes the table connection object
   * @param {Object} tableConnection - table connection with array of edges to table nodes
   * @param {string} source - datasource of the payload
   * @returns {Object} - tables and their associated columns models
   */
  _normalizeTableConnection(tableConnection: Connection<TableNode>, source: string): EverythingMetadataPayload {
    const edges = tableConnection.edges || [];
    let metrics: MetricMetadataModel[] = [];
    let dimensions: DimensionMetadataModel[] = [];
    let timeDimensions: TimeDimensionMetadataModel[] = [];
    let columnFunctions: ColumnFunctionMetadataModel[] = [];

    const tablePayloads = edges.map(({ node: table }) => {
      const newTable: TableMetadataPayload = {
        id: table.id,
        name: table.friendlyName,
        category: table.category,
        description: table.description,
        cardinality: this._normalizeCardinality(table.cardinality),
        isFact: table.isFact ?? true,
        metricIds: [],
        dimensionIds: [],
        timeDimensionIds: [],
        requestConstraintIds: [],
        source,
      };

      const newTableMetrics = this._normalizeTableMetrics(table.metrics, table.id, source);
      const newTableDimensions = this._normalizeTableDimensions(table.dimensions, table.id, source);
      const newTableTimeDimensionsAndColFuncs = this._normalizeTableTimeDimensions(
        table.timeDimensions,
        table.id,
        source
      );
      const newTableTimeDimensions = newTableTimeDimensionsAndColFuncs.map((obj) => obj.timeDimension);
      const newTableTimeDimensionColFuncs = newTableTimeDimensionsAndColFuncs.map((obj) => obj.columnFunction);

      newTable.metricIds = newTableMetrics.map((m) => m.metricModel.id);
      newTable.dimensionIds = newTableDimensions.map((d) => d.dimensionModel.id);
      newTable.timeDimensionIds = newTableTimeDimensions.map((d) => d.id);

      metrics = [...metrics, ...newTableMetrics.map((m) => m.metricModel)];
      dimensions = [...dimensions, ...newTableDimensions.map((d) => d.dimensionModel)];
      timeDimensions = [...timeDimensions, ...newTableTimeDimensions];
      columnFunctions = [
        ...columnFunctions,
        ...newTableTimeDimensionColFuncs,
        ...newTableMetrics.map((m) => m.columnFunction),
        ...newTableDimensions.map((m) => m.columnFunction),
      ].filter(isPresent);

      return newTable;
    });

    return {
      tables: tablePayloads.map(this.createTableModel.bind(this)),
      metrics,
      dimensions,
      timeDimensions,
      columnFunctions,
      requestConstraints: [],
    };
  }

  /**
   * @private
   * @method _normalizeTableMetrics - normalizes the MetricConnection JSON response
   * @param {Connection<MetricNode>} metricConnection - MetricConnection JSON
   * @param {string} source - datasource name
   * @returns {Object[]} - metric models
   */
  _normalizeTableMetrics(
    metricConnection: Connection<MetricNode>,
    tableId: string,
    source: string
  ): {
    metricModel: MetricMetadataModel;
    columnFunction: ColumnFunctionMetadataModel | null;
  }[] {
    return metricConnection.edges.map(({ node }) => {
      const columnFunction = this.createColumnFunction(node.id, node.arguments, source);
      const payload: MetricMetadataPayload = {
        id: node.id,
        name: node.friendlyName,
        description: node.description,
        category: node.category,
        valueType: node.valueType,
        tableId,
        source,
        tags: node.tags,
        defaultFormat: node.defaultFormat,
        isSortable: true,
        type: node.columnType,
        expression: node.expression,
        columnFunctionId: columnFunction?.id,
      };
      return {
        metricModel: this.createMetricModel(payload),
        columnFunction,
      };
    });
  }

  /**
   * @private
   * @method _normalizeDimensions - normalizes the Connection<DimensionNode> JSON response
   * @param {Connection<DimensionNode>} dimensionConnection - Connection<DimensionNode> JSON
   * @param {string} source - datasource name
   * @returns dimension models
   */
  _normalizeTableDimensions(
    dimensionConnection: Connection<DimensionNode>,
    tableId: string,
    source: string
  ): {
    dimensionModel: DimensionMetadataModel;
    columnFunction: ColumnFunctionMetadataModel | null;
  }[] {
    return dimensionConnection.edges.map((edge: Edge<DimensionNode>) => {
      const { node } = edge;
      const columnFunction = this.createColumnFunction(node.id, node.arguments, source);

      const cardinality = this._normalizeCardinality(node.cardinality);
      const tableSource = node.tableSource?.edges[0];
      const payload: ElideDimensionMetadataPayload = {
        id: node.id,
        name: node.friendlyName,
        description: node.description,
        ...(cardinality ? { cardinality } : {}),
        category: node.category,
        valueType: node.valueType,
        tableId,
        source,
        tags: node.tags,
        isSortable: true,
        type: node.columnType,
        expression: node.expression,
        valueSourceType: node.valueSourceType,
        tableSource: tableSource
          ? {
              valueSource: tableSource.node.valueSource.edges[0].node.id,
              suggestionColumns: tableSource.node.suggestionColumns.edges.map((e) => ({ id: e.node.id as string })),
            }
          : undefined,
        values: node.values,
        columnFunctionId: columnFunction?.id,
      };
      return {
        dimensionModel: this.createDimensionModel(payload),
        columnFunction,
      };
    });
  }

  /**
   * @private
   * @method _normalizeTableTimeDimensions - normalizes the TimeConnection<DimensionNode> JSON response
   * @param {TimeConnection<DimensionNode>} timeConnection<DimensionNode> - TimeConnection<DimensionNode> JSON
   * @param {string} source - datasource name
   * @returns timeDimension models
   */
  _normalizeTableTimeDimensions(
    timeDimensionConnection: Connection<TimeDimensionNode>,
    tableId: string,
    source: string
  ): { timeDimension: TimeDimensionMetadataModel; columnFunction: ColumnFunctionMetadataModel }[] {
    return timeDimensionConnection.edges.map((edge: Edge<TimeDimensionNode>) => {
      const { node } = edge;
      const supportedGrains = node.supportedGrains.edges.map((edge) => edge.node);
      const columnFunctionPayload = this.createTimeGrainColumnFunction(node.id, supportedGrains, source);
      const timeDimensionPayload: TimeDimensionMetadataPayload = {
        id: node.id,
        name: node.friendlyName,
        description: node.description,
        category: node.category,
        valueType: node.valueType,
        tableId,
        columnFunctionId: columnFunctionPayload.id,
        source,
        tags: node.tags,
        supportedGrains: node.supportedGrains.edges
          .map(({ node }) => node)
          .map(({ expression, grain }) => ({ id: this.normalizeTimeGrain(grain), expression, grain })),

        timeZone: node.timeZone,
        isSortable: true,
        type: node.columnType,
        expression: node.expression,
        valueSourceType: node.valueSourceType,
      };
      return {
        timeDimension: this.createTimeDimensionModel(timeDimensionPayload),
        columnFunction: this.createColumnFunctionModel(columnFunctionPayload),
      };
    });
  }

  /**
   * Normalize raw elide time grains
   */
  private normalizeTimeGrain(rawGrain: string): Grain {
    const grain = rawGrain.toLowerCase() as Grain | 'isoweek';
    return 'isoweek' === grain ? 'isoWeek' : grain;
  }

  /**
   * @param timeDimensionId
   * @param grainNodes
   * @param dataSourceName
   * @returns new column function with the supported grains as parameters
   */
  private createTimeGrainColumnFunction(
    timeDimensionId: string,
    grainNodes: TimeDimensionGrainNode[],
    dataSourceName: string
  ): ColumnFunctionMetadataPayload {
    const grainIds = grainNodes.map((g) => g.grain.toLowerCase());
    const grains = grainIds.sort().join(',');
    const columnFunctionId = `${this.namespace}:timeGrain(column=${timeDimensionId};grains=${grains})`;
    let defaultValue;
    const { defaultTimeGrain } = config.navi;
    if (defaultTimeGrain && grainIds.includes(defaultTimeGrain)) {
      defaultValue = defaultTimeGrain;
    } else {
      defaultValue = grainIds[0];
    }
    return {
      id: columnFunctionId,
      name: 'Time Grain',
      source: dataSourceName,
      description: 'Time Grain',
      _parametersPayload: [
        {
          id: 'grain',
          name: 'Time Grain',
          description: 'The time grain to group dates by',
          source: dataSourceName,
          defaultValue,
          valueType: DataType.TEXT,
          valueSourceType: ValueSourceType.ENUM,
          _localValues: grainNodes.map((grain) => {
            const grainName = grain.grain.toLowerCase();
            return {
              id: grainName,
              description: upperFirst(grainName),
              name: grainName,
            };
          }),
        },
      ],
    };
  }

  /**
   * Normalize column arguments as a column function
   */
  private createColumnFunction(
    columnId: string,
    columnArguments: Connection<ElideArgument>,
    source: string
  ): ColumnFunctionMetadataModel | null {
    // do not create a column function if arguments are not present
    if (columnArguments.edges.length === 0) {
      return null;
    }

    const id = `${this.namespace}:elide-${source}:column=${columnId}`;

    const _parametersPayload: FunctionParameterMetadataPayload[] = columnArguments.edges.map(({ node }) => ({
      id: node.name,
      name: node.name,
      description: node.description,
      source,
      valueType: node.type,
      valueSourceType: node.valueSourceType,
      tableSource: this.normalizeTableSource(node.tableSource?.edges?.[0]?.node),
      defaultValue: node.defaultValue,
      _localValues: node.values.map((v) => ({ id: v, name: v })),
    }));

    const payload: ColumnFunctionMetadataPayload = {
      id,
      name: 'Column Arguments',
      description: 'Column Arguments',
      source,
      _parametersPayload,
    };
    return this.createColumnFunctionModel(payload);
  }

  /**
   * Normalizes elide table source to internal table source shape
   */
  private normalizeTableSource(tableSource: ElideTableSource): TableSource | undefined {
    if (tableSource) {
      const valueSource = tableSource.valueSource.edges?.[0].node.id;
      return valueSource ? { valueSource } : undefined;
    }
    return undefined;
  }

  /**
   * Normalizes elide cardinalities to navi sizes
   */
  _normalizeCardinality(elideCardinality?: ElideCardinality): Cardinality | undefined {
    const cardinality = elideCardinality?.toLowerCase() as Lowercase<ElideCardinality> | undefined;
    if (cardinality === 'tiny' || cardinality === 'small') {
      return CARDINALITY_SIZES[0];
    } else if (cardinality === 'medium') {
      return CARDINALITY_SIZES[1];
    } else if (cardinality === 'large' || cardinality === 'huge') {
      return CARDINALITY_SIZES[2];
    }
    return undefined;
  }

  private supportedTypes = new Set<keyof MetadataModelMap>(['everything']);

  normalize<K extends keyof MetadataModelMap>(
    type: K,
    rawPayload: TablePayload,
    dataSourceName: string
  ): MetadataModelMap[K] {
    assert(
      `ElideMetadataSerializer only supports normalizing type: ${[...this.supportedTypes]}`,
      this.supportedTypes.has(type)
    );

    const normalized: MetadataModelMap['everything'] = this._normalizeTableConnection(rawPayload.table, dataSourceName);
    return normalized as MetadataModelMap[K];
  }
}

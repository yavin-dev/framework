/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import config from 'ember-get-config';
import CARDINALITY_SIZES from '../../utils/enums/cardinality-sizes';
import { ColumnFunctionMetadataPayload } from '../../models/metadata/column-function';
import { ColumnType } from '../../models/metadata/column';
import { TableMetadataPayload } from '../../models/metadata/table';
import { MetricMetadataPayload } from '../../models/metadata/metric';
import { DimensionMetadataPayload } from '../../models/metadata/dimension';
import { TimeDimensionMetadataPayload } from '../../models/metadata/time-dimension';
import NaviMetadataSerializer, { MetadataPayloadMap, EverythingMetadataPayload } from './interface';
import { upperFirst } from 'lodash-es';
import { INTRINSIC_VALUE_EXPRESSION } from 'navi-data/models/metadata/function-parameter';
import { assert } from '@ember/debug';

type Edge<T> = {
  node: T;
  cursor: string;
};
export type Connection<T> = {
  edges: Edge<T>[];
  pageInfo: TODO;
};
type ColumnNode = {
  id: string;
  name: string;
  description: string;
  category: string;
  valueType: TODO<string>;
  columnTags: string[];
  columnType: ColumnType;
  expression: string;
};
export type MetricNode = ColumnNode & { defaultFormat: string };
export type DimensionNode = ColumnNode;
export type TimeDimensionNode = DimensionNode & {
  supportedGrain: Connection<TimeDimensionGrainNode>;
  timeZone: string;
};
export type TimeDimensionGrainNode = {
  id: string;
  expression: string;
  grain: string;
};
type TableNode = {
  id: string;
  name: string;
  description: string;
  category: string;
  cardinality: typeof CARDINALITY_SIZES[number];
  metrics: Connection<MetricNode>;
  dimensions: Connection<DimensionNode>;
  timeDimensions: Connection<TimeDimensionNode>;
};

export interface TablePayload {
  table: Connection<TableNode>;
}

export default class ElideMetadataSerializer extends EmberObject implements NaviMetadataSerializer {
  private namespace = 'normalizer-generated';

  /**
   * Transform the elide metadata into a shape that our internal data models can use
   * @private
   * @method _normalizeTableConnection - normalizes the table connection object
   * @param {Object} tableConnection - table connection with array of edges to table nodes
   * @param {string} source - datasource of the payload
   * @returns {Object} - normalized tables and their associated columns
   */
  _normalizeTableConnection(tableConnection: Connection<TableNode>, source: string): EverythingMetadataPayload {
    const edges = tableConnection.edges || [];
    let metrics: MetricMetadataPayload[] = [];
    let dimensions: DimensionMetadataPayload[] = [];
    let timeDimensions: TimeDimensionMetadataPayload[] = [];
    let columnFunctions: ColumnFunctionMetadataPayload[] = [];

    const tables = edges.map(({ node: table }) => {
      const newTable: TableMetadataPayload = {
        id: table.id,
        name: table.name,
        category: table.category,
        description: table.description,
        cardinality: table.cardinality,
        metricIds: [],
        dimensionIds: [],
        timeDimensionIds: [],
        source
      };

      const newTableMetrics = this._normalizeTableMetrics(table.metrics, table.id, source);
      const newTableDimensions = this._normalizeTableDimensions(table.dimensions, table.id, source);
      const newTableTimeDimensionsAndColFuncs = this._normalizeTableTimeDimensions(
        table.timeDimensions,
        table.id,
        source
      );
      const newTableTimeDimensions = newTableTimeDimensionsAndColFuncs.map(obj => obj.timeDimension);
      const newTableTimeDimensionColFuncs = newTableTimeDimensionsAndColFuncs.map(obj => obj.columnFunction);

      newTable.metricIds = newTableMetrics.map(m => m.id);
      newTable.dimensionIds = newTableDimensions.map(d => d.id);
      newTable.timeDimensionIds = newTableTimeDimensions.map(d => d.id);

      metrics = [...metrics, ...newTableMetrics];
      dimensions = [...dimensions, ...newTableDimensions];
      timeDimensions = [...timeDimensions, ...newTableTimeDimensions];
      columnFunctions = [...columnFunctions, ...newTableTimeDimensionColFuncs];

      return newTable;
    });

    return {
      tables,
      metrics,
      dimensions,
      timeDimensions,
      columnFunctions
    };
  }

  /**
   * @private
   * @method _normalizeTableMetrics - normalizes the MetricConnection JSON response
   * @param {Connection<MetricNode>} metricConnection - MetricConnection JSON
   * @param {string} source - datasource name
   * @returns {Object[]} - normalized metric objects
   */
  _normalizeTableMetrics(
    metricConnection: Connection<MetricNode>,
    tableId: string,
    source: string
  ): MetricMetadataPayload[] {
    return metricConnection.edges.map((edge: Edge<MetricNode>) => {
      const { node } = edge;
      return {
        id: node.id,
        name: node.name,
        description: node.description,
        category: node.category,
        valueType: node.valueType,
        tableId,
        source,
        tags: node.columnTags,
        defaultFormat: node.defaultFormat,
        type: node.columnType,
        expression: node.expression
      };
    });
  }

  /**
   * @private
   * @method _normalizeDimensions - normalizes the Connection<DimensionNode> JSON response
   * @param {Connection<DimensionNode>} dimensionConnection - Connection<DimensionNode> JSON
   * @param {string} source - datasource name
   * @returns {Object[]} - normalized dimension objects
   */
  _normalizeTableDimensions(
    dimensionConnection: Connection<DimensionNode>,
    tableId: string,
    source: string
  ): DimensionMetadataPayload[] {
    return dimensionConnection.edges.map((edge: Edge<DimensionNode>) => {
      const { node } = edge;
      return {
        id: node.id,
        name: node.name,
        description: node.description,
        category: node.category,
        valueType: node.valueType,
        tableId,
        source,
        tags: node.columnTags,
        type: node.columnType,
        expression: node.expression
      };
    });
  }

  /**
   * @private
   * @method _normalizeTableTimeDimensions - normalizes the TimeConnection<DimensionNode> JSON response
   * @param {TimeConnection<DimensionNode>} timeConnection<DimensionNode> - TimeConnection<DimensionNode> JSON
   * @param {string} source - datasource name
   * @returns {Object[]} - normalized timeDimension objects
   */
  _normalizeTableTimeDimensions(
    timeDimensionConnection: Connection<TimeDimensionNode>,
    tableId: string,
    source: string
  ): { timeDimension: TimeDimensionMetadataPayload; columnFunction: ColumnFunctionMetadataPayload }[] {
    return timeDimensionConnection.edges.map((edge: Edge<TimeDimensionNode>) => {
      const { node } = edge;
      const supportedGrains = node.supportedGrain.edges.map(edge => edge.node);
      const columnFunction = this.createTimeGrainColumnFunction(node.id, supportedGrains, source);
      return {
        timeDimension: {
          id: node.id,
          name: node.name,
          description: node.description,
          category: node.category,
          valueType: node.valueType,
          tableId,
          columnFunctionId: columnFunction.id,
          source,
          tags: node.columnTags,
          supportedGrains: node.supportedGrain.edges.map(edge => edge.node),
          timeZone: node.timeZone,
          type: node.columnType,
          expression: node.expression
        },
        columnFunction
      };
    });
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
    const grainIds = grainNodes.map(g => g.grain.toLowerCase());
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
          type: 'ref',
          expression: INTRINSIC_VALUE_EXPRESSION,
          defaultValue,
          _localValues: grainNodes.map(grain => ({
            id: grain.id,
            description: upperFirst(grain.grain.toLowerCase()),
            name: grain.grain.toLowerCase()
          }))
        }
      ]
    };
  }

  private supportedTypes = new Set<keyof MetadataPayloadMap>(['everything']);

  normalize<K extends keyof MetadataPayloadMap>(
    type: K,
    rawPayload: TablePayload,
    dataSourceName: string
  ): MetadataPayloadMap[K] {
    assert(
      `ElideMetadataSerializer only supports normalizing type: ${[...this.supportedTypes]}`,
      this.supportedTypes.has(type)
    );

    const normalized: MetadataPayloadMap['everything'] = this._normalizeTableConnection(
      rawPayload.table,
      dataSourceName
    );
    return normalized as MetadataPayloadMap[K];
  }
}

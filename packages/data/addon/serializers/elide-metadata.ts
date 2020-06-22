/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import CARDINALITY_SIZES from '../utils/enums/cardinality-sizes';
import { ColumnType } from '../models/metadata/column';
import { TableMetadataPayload } from '../models/metadata/table';
import { MetricMetadataPayload } from '../models/metadata/metric';
import { DimensionMetadataPayload } from '../models/metadata/dimension';
import { TimeDimensionMetadataPayload } from '../models/metadata/time-dimension';

type Edge<T> = {
  node: T;
  cursor: string;
};
type Connection<T> = {
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
type MetricNode = ColumnNode & { defaultFormat: string };
type DimensionNode = ColumnNode;
type TimeDimensionNode = DimensionNode & {
  supportedGrains: Connection<TimeDimensionGrainNode>;
  timeZone: string;
};
type TimeDimensionGrainNode = {
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
  source: string;
}

export interface NormalizedMetadata {
  tables: TableMetadataPayload[];
  metrics: MetricMetadataPayload[];
  dimensions: DimensionMetadataPayload[];
  timeDimensions: TimeDimensionMetadataPayload[];
}

export default class ElideMetadataSerializer extends EmberObject {
  /**
   * Transform the elide metadata into a shape that our internal data models can use
   * @private
   * @method _normalizeTableConnection - normalizes the table connection object
   * @param {Object} tableConnection - table connection with array of edges to table nodes
   * @param {string} source - datasource of the payload
   * @returns {Object} - normalized tables and their associated columns
   */
  _normalizeTableConnection(tableConnection: Connection<TableNode>, source: string): NormalizedMetadata {
    const edges = tableConnection.edges || [];
    let metrics: MetricMetadataPayload[] = [];
    let dimensions: DimensionMetadataPayload[] = [];
    let timeDimensions: TimeDimensionMetadataPayload[] = [];

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
      const newTableTimeDimensions = this._normalizeTableTimeDimensions(table.timeDimensions, table.id, source);

      newTable.metricIds = newTableMetrics.map(m => m.id);
      newTable.dimensionIds = newTableDimensions.map(d => d.id);
      newTable.timeDimensionIds = newTableTimeDimensions.map(d => d.id);

      metrics = metrics.concat(newTableMetrics);
      dimensions = dimensions.concat(newTableDimensions);
      timeDimensions = timeDimensions.concat(newTableTimeDimensions);

      return newTable;
    });

    return {
      tables,
      metrics,
      dimensions,
      timeDimensions
      // TODO: Support metric functions once it is supported by Elide
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
  ): TimeDimensionMetadataPayload[] {
    return timeDimensionConnection.edges.map((edge: Edge<TimeDimensionNode>) => {
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
        supportedGrains: node.supportedGrains.edges.map(edge => edge.node),
        timeZone: node.timeZone,
        type: node.columnType,
        expression: node.expression
      };
    });
  }

  /**
   * @method normalize - normalizes the JSON response
   * @param response {Object} - JSON response object
   * @returns {Object} - normalized JSON object
   */
  normalize(payload: TablePayload) {
    if (this.isTablePayload(payload)) {
      return this._normalizeTableConnection(payload.table, payload.source);
    }
    return payload;
  }

  /**
   * Runtime typecheck that typescript can understand
   * @param payload
   * @return true if payload is an instance of TablePayload
   * */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isTablePayload(payload: any): payload is TablePayload {
    return !!payload.table;
  }
}

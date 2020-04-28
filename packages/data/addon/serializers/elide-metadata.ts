/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import CARDINALITY_SIZES from '../utils/enums/cardinality-sizes';
import { NormalizedTable } from '../models/metadata/table';
import { NormalizedMetric } from '../models/metadata/metric';
import { NormalizedDimension } from '../models/metadata/dimension';
import { NormalizedTimeDimension } from '../models/metadata/time-dimension';

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
};
type MetricNode = ColumnNode & { defaultFormat: string };
type DimensionNode = ColumnNode;
type TimeDimensionNode = DimensionNode & {
  supportedGrains: string[];
  timeZone: string;
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

type TablePayload = {
  tables: Connection<TableNode>;
  source: string;
};

export default class ElideMetadataSerializer extends EmberObject {
  /**
   * Transform the elide metadata into a shape that our internal data models can use
   * @private
   * @method _normalizeTableConnection - normalizes the table connection object
   * @param {Object} tableConnection - table connection with array of edges to table nodes
   * @param {string} source - datasource of the payload
   * @returns {Object} - normalized tables and their associated columns
   */
  _normalizeTableConnection(tableConnection: Connection<TableNode>, source: string) {
    const edges = tableConnection.edges || [];
    let metrics: NormalizedMetric[] = [];
    let dimensions: NormalizedDimension[] = [];
    let timeDimensions: NormalizedTimeDimension[] = [];

    const tables = edges.map(({ node: table }) => {
      const newTable: NormalizedTable = {
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

      newTable.metricIds = newTableMetrics.map((m: NormalizedMetric) => m.id);
      newTable.dimensionIds = newTableDimensions.map((d: NormalizedDimension) => d.id);
      newTable.timeDimensionIds = newTableTimeDimensions.map((d: NormalizedTimeDimension) => d.id);

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
  _normalizeTableMetrics(metricConnection: Connection<MetricNode>, tableId: string, source: string) {
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
        defaultFormat: node.defaultFormat
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
  _normalizeTableDimensions(dimensionConnection: Connection<DimensionNode>, tableId: string, source: string) {
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
        tags: node.columnTags
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
  ) {
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
        supportedGrains: node.supportedGrains,
        timeZone: node.timeZone
      };
    });
  }

  /**
   * @method normalize - normalizes the JSON response
   * @param response {Object} - JSON response object
   * @returns {Object} - normalized JSON object
   */
  normalize(payload: TablePayload) {
    if (payload?.tables) {
      return this._normalizeTableConnection(payload.tables, payload.source);
    }
    return payload;
  }
}

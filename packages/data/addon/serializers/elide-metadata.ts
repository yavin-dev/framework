/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { MetricConnection, MetricEdge } from '../models/metadata/metric';
import { DimensionConnection, DimensionEdge } from '../models/metadata/dimension';
import { TimeDimensionConnection, TimeDimensionEdge } from '../models/metadata/time-dimension';
import { TableConnection } from '../models/metadata/table';

type TablePayload = {
  tables: TableConnection;
  source: string;
};

type NormalizedTable = {
  id: string;
  name: string;
  category: string;
  description: string;
  cardinality: string;
  metricIds: string[];
  dimensionIds: string[];
  timeDimensionIds: string[];
  source: string;
};

type NormalizedColumn = {
  id: string;
  name: string;
  category: string;
  description: string;
  tableId: string;
  source: string;
  valueType: TODO<string>;
  tags: string[];
};

type NormalizedMetric = NormalizedColumn & { defaultFormat: string };
type NormalizedDimension = NormalizedColumn;
type NormalizedTimeDimension = NormalizedDimension & {
  supportedGrains: string[];
  timeZone: TODO;
};

export default class ElideMetadataSerializer extends EmberObject {
  /**
   * Transform the elide metadata into a shape that our internal data models can use
   * @private
   * @method _normalizeTableConnection - normalizes the table connection object
   * @param {Object} tableConnection - table connection with array of edges to table nodes
   * @param {String} source - datasource of the payload
   * @returns {Object} - normalized tables and their associated columns
   */
  _normalizeTableConnection(tableConnection: TableConnection, source: string) {
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
   * @param {MetricConnection} metricConnection - MetricConnection JSON
   * @param {String} source - datasource name
   * @returns {Object[]} - normalized metric objects
   */
  _normalizeTableMetrics(metricConnection: MetricConnection, tableId: string, source: string) {
    return metricConnection.edges.map((edge: MetricEdge) => {
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
   * @method _normalizeDimensions - normalizes the DimensionConnection JSON response
   * @param {DimensionConnection} dimensionConnection - DimensionConnection JSON
   * @param {String} source - datasource name
   * @returns {Object[]} - normalized dimension objects
   */
  _normalizeTableDimensions(dimensionConnection: DimensionConnection, tableId: string, source: string) {
    return dimensionConnection.edges.map((edge: DimensionEdge) => {
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
   * @method _normalizeTableTimeDimensions - normalizes the TimeDimensionConnection JSON response
   * @param {TimeDimensionConnection} timeDimensionConnection - TimeDimensionConnection JSON
   * @param {String} source - datasource name
   * @returns {Object[]} - normalized timeDimension objects
   */
  _normalizeTableTimeDimensions(timeDimensionConnection: TimeDimensionConnection, tableId: string, source: string) {
    return timeDimensionConnection.edges.map((edge: TimeDimensionEdge) => {
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

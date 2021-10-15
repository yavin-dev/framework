/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviMetadataSerializer from './base';
import config from 'ember-get-config';
import CARDINALITY_SIZES from '../../utils/enums/cardinality-sizes';
import { INTRINSIC_VALUE_EXPRESSION } from 'navi-data/models/metadata/function-parameter';
import { capitalize } from '@ember/string';
import { getOwner } from '@ember/application';
import { sortBy } from 'lodash-es';
import { assert } from '@ember/debug';
import { isNone } from '@ember/utils';
import { GrainOrdering } from 'navi-data/models/metadata/bard/table';
import type ColumnFunctionMetadataModel from 'navi-data/models/metadata/column-function';
import type { ColumnFunctionMetadataPayload } from 'navi-data/models/metadata/column-function';
import type MetricMetadataModel from 'navi-data/models/metadata/metric';
import type { MetricMetadataPayload } from 'navi-data/models/metadata/metric';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { DimensionMetadataPayload } from 'navi-data/models/metadata/dimension';
import type TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';
import type { TimeDimensionMetadataPayload } from 'navi-data/models/metadata/time-dimension';
import type RequestConstraintMetadataModel from 'navi-data/models/metadata/request-constraint';
import type { RequestConstraintMetadataPayload } from 'navi-data/models/metadata/request-constraint';
import type { MetadataModelMap, EverythingMetadataPayload } from './base';
import type BardTableMetadataModel from 'navi-data/models/metadata/bard/table';
import type { BardTableMetadataPayload } from 'navi-data/models/metadata/bard/table';
import type {
  FunctionParameterMetadataPayload,
  ColumnFunctionParametersValues,
} from 'navi-data/models/metadata/function-parameter';
import type { Cardinality } from '../../utils/enums/cardinality-sizes';
import type { Grain } from 'navi-data/utils/date';
import type { Factory } from 'navi-data/models/native-with-create';
import type TableMetadataModel from 'navi-data/models/metadata/table';

const SMALL_CARDINALITY = config.navi.cardinalities.small;
const MEDIUM_CARDINALITY = config.navi.cardinalities.medium;

export type RawEverythingPayload = {
  tables: RawTablePayload[];
  metricFunctions?: RawColumnFunction[];
};

type RawDimensionField = {
  name: string;
  description?: string;
  tags?: string[];
};

type RawColumnPayload = {
  name: string;
  description?: string;
  longName: string;
  category?: string;
};

export type RawDimensionPayload = RawColumnPayload & {
  datatype?: 'text' | 'number' | 'date' | 'dateTime';
  storageStrategy?: TODO<'loaded' | 'none'>;
  cardinality: number;
  fields: RawDimensionField[];
};

export type RawMetricPayload = RawColumnPayload & {
  type: TODO<string>;
  metricFunctionId?: string;
  parameters?: RawColumnFunctionArguments;
};

export type RawColumnFunction = {
  id: string;
  name: string;
  description: string;
  arguments: RawColumnFunctionArguments;
};

export type RawColumnFunctionArguments = {
  [k: string]: RawColumnFunctionArgument;
};

export type RawColumnFunctionArgument =
  | { type: 'enum'; defaultValue?: string | null; values: ColumnFunctionParametersValues; description?: string }
  | { type: 'dimension'; defaultValue?: string | null; dimensionName: string; description?: string };

export type GrainWithAll = Grain | 'all';
type RawTimeGrainPayload = {
  name: GrainWithAll;
  longName: string;
  description?: string;
  retention?: string;
  dimensions: RawDimensionPayload[];
  metrics: RawMetricPayload[];
};

export type RawTablePayload = {
  timeGrains: RawTimeGrainPayload[];
  name: string;
  longName: string;
  description?: string;
  category?: string;
};

type TimeGrainInfo = {
  name: Grain;
  longName: string;
  description?: string;
};

type TableTimeGrainInfo = {
  hasAllGrain: boolean;
  timeGrains: TimeGrainInfo[];
};

function grainForDataType(dataType: RawDimensionPayload['datatype']): Grain | undefined {
  if (dataType === 'dateTime') {
    return 'second';
  } else if (dataType === 'date') {
    return 'day';
  }
  return undefined;
}

export default class BardMetadataSerializer extends NaviMetadataSerializer {
  private namespace = 'normalizer-generated';

  private bardTableFactory = getOwner(this).factoryFor('model:metadata/bard/table') as Factory<
    typeof BardTableMetadataModel
  >;

  protected createTableModel(payload: BardTableMetadataPayload): TableMetadataModel {
    return this.bardTableFactory.create(payload);
  }

  /**
   * Transform the bard metadata into a shape that our internal data models can use
   * @param rawPayload - object containing all metadata for a datasource
   * @param source - datasource of the payload
   * @returns normalized table object
   */
  private normalizeEverything(rawPayload: RawEverythingPayload, dataSourceName: string): EverythingMetadataPayload {
    const { tables: rawTables, metricFunctions: rawColumnFunctions } = rawPayload;

    // build dimension and metric arrays
    const metrics: { [k: string]: MetricMetadataModel } = {};
    const dimensions: { [k: string]: DimensionMetadataModel } = {};
    const timeDimensions: { [k: string]: TimeDimensionMetadataModel } = {};
    const requestConstraints: { [k: string]: RequestConstraintMetadataModel } = {};
    const convertedToColumnFunctions: { [k: string]: ColumnFunctionMetadataModel } = {};
    const tablePayloads: BardTableMetadataPayload[] = rawTables.map((table: RawTablePayload) => {
      // Reduce all columns regardless of timegrain into one object
      const allTableColumns = table.timeGrains.reduce(
        (acc, timegrain) => {
          const {
            metrics: currentMetrics,
            dimensions: currentDimensions,
            timeDimensions: currentTimeDimensions,
            tableMetricIds,
            tableDimensionIds,
            tableTimeDimensionIds,
          } = acc;

          // Construct each dimension / time-dimension
          timegrain.dimensions.forEach((dimension) => {
            const isTimeDimension = dimension.datatype === 'date' || dimension.datatype === 'dateTime';

            const accDimensionList = isTimeDimension ? currentTimeDimensions : currentDimensions;
            const accTableDimensionList = isTimeDimension ? tableTimeDimensionIds : tableDimensionIds;

            const [newDim] = isTimeDimension
              ? this.normalizeTimeDimensions([dimension], dataSourceName)
              : this.normalizeDimensions([dimension], dataSourceName);

            let columnFunction: ColumnFunctionMetadataModel;
            if (isTimeDimension) {
              // Create function for selecting dimension field and grain
              columnFunction = this.createTimeDimensionColumnFunction(dimension, dataSourceName);
            } else {
              // Create function for selecting dimension field
              columnFunction = this.createDimensionFieldColumnFunction(dimension, dataSourceName);
            }

            convertedToColumnFunctions[columnFunction.id] = columnFunction;
            newDim.columnFunctionId = columnFunction.id; // attach function to dimension

            const newDimCardinality = newDim.cardinality || CARDINALITY_SIZES[2];
            if (CARDINALITY_SIZES.indexOf(newDimCardinality) > CARDINALITY_SIZES.indexOf(acc.tableCardinality)) {
              acc.tableCardinality = newDimCardinality;
            }

            accDimensionList[newDim.id] = newDim; // Add dim to all dimensions list
            accTableDimensionList.add(newDim.id); // Add dim id to table's dimensionIds/timeDimensionIds list
          });

          // Construct each metric and metric function + function parameters if necessary
          timegrain.metrics.forEach((metric: RawMetricPayload) => {
            const convertedToColumnFunction = this.getColumnFunctionFromParameters(metric, dataSourceName);
            if (convertedToColumnFunction) {
              metric.metricFunctionId = convertedToColumnFunction.id;
              convertedToColumnFunctions[convertedToColumnFunction.id] = convertedToColumnFunction;
            }

            const [newMetric] = this.normalizeMetrics([metric], dataSourceName);
            currentMetrics[newMetric.id] = newMetric; // Add metric to all metrics list
            tableMetricIds.add(newMetric.id); // Add metric id to table's metricIds list
          });

          return acc;
        },
        {
          metrics,
          dimensions,
          timeDimensions,
          tableMetricIds: new Set<string>(),
          tableDimensionIds: new Set<string>(),
          tableTimeDimensionIds: new Set<string>(),
          tableCardinality: CARDINALITY_SIZES[0] as Cardinality,
        }
      );

      const timeGrainInfo = this.parseTableGrains(table);
      // Create a dateTime timeDimension with columnFunctionId to select timeGrain
      const columnFunction = this.createTimeGrainColumnFunction(table, timeGrainInfo, dataSourceName);
      const dateTime = this.createDateTime(table, timeGrainInfo, dataSourceName);
      dateTime.columnFunctionId = columnFunction.id;
      convertedToColumnFunctions[columnFunction.id] = columnFunction;
      allTableColumns.timeDimensions[dateTime.id] = dateTime;
      allTableColumns.tableTimeDimensionIds.add(dateTime.id);

      const requiredDateTimeFilter = this.createRequiredDateTimeFilterConstraint(table, dataSourceName);
      requestConstraints[requiredDateTimeFilter.id] = requiredDateTimeFilter;
      const constraints = [requiredDateTimeFilter.id];
      if (!timeGrainInfo.hasAllGrain) {
        const requiredDateTimeColumn = this.createRequiredDateTimeColumnConstraint(table, dataSourceName);
        requestConstraints[requiredDateTimeColumn.id] = requiredDateTimeColumn;
        constraints.push(requiredDateTimeColumn.id);
      }

      return {
        id: table.name,
        name: table.longName,
        description: table.description,
        category: table.category,
        cardinality: allTableColumns.tableCardinality,
        isFact: true,
        timeGrainIds: timeGrainInfo.timeGrains.map((g) => g.name),
        hasAllGrain: timeGrainInfo.hasAllGrain,
        source: dataSourceName,
        metricIds: [...allTableColumns.tableMetricIds],
        dimensionIds: [...allTableColumns.tableDimensionIds],
        timeDimensionIds: [...allTableColumns.tableTimeDimensionIds],
        requestConstraintIds: [...constraints],
      };
    });

    const columnFunctions = rawColumnFunctions ? this.normalizeColumnFunctions(rawColumnFunctions, dataSourceName) : [];

    return {
      tables: tablePayloads.map(this.createTableModel.bind(this)),
      dimensions: Object.values(dimensions),
      metrics: Object.values(metrics),
      timeDimensions: Object.values(timeDimensions),
      columnFunctions: [...columnFunctions, ...Object.values(convertedToColumnFunctions)],
      requestConstraints: Object.values(requestConstraints),
    };
  }

  /**
   * Separates all grain and normalizes fili timegrains
   * @param table - the table to parse time grain info for
   */
  parseTableGrains(table: RawTablePayload): TableTimeGrainInfo {
    const AllGrain = 'all';
    const hasAllGrain = table.timeGrains.some((g) => g.name === AllGrain);
    const tableGrains = table.timeGrains
      .filter((g) => g.name !== AllGrain)
      .map((g) => ({
        name: this.normalizeTimeGrain(g.name) as Grain,
        longName: g.longName,
        description: g.description,
      }));
    const timeGrains = sortBy(tableGrains, (g) => GrainOrdering[g.name]);

    return { hasAllGrain, timeGrains };
  }

  /**
   * Creates a column function consisting of the dimension fields
   * @param dimension - the dimension to extract fields from
   * @param dataSourceName - data source name
   */
  createTimeDimensionColumnFunction(
    dimension: RawDimensionPayload,
    dataSourceName: string
  ): ColumnFunctionMetadataModel {
    const { fields = [] } = dimension;
    const defaultValue =
      fields.find((field) => field.tags && field.tags.includes('primaryKey'))?.name || fields[0]?.name;
    const sorted = fields.map((field) => field.name).sort();
    const grain = grainForDataType(dimension.datatype);
    const grains: Grain[] = grain ? [grain] : [];
    const columnFunctionId = `${this.namespace}:timeDimension(fields=${sorted.join(',')},grains=${grains.join(',')})`;
    const payload: ColumnFunctionMetadataPayload = {
      id: columnFunctionId,
      name: 'Dimension Field',
      source: dataSourceName,
      description: 'Dimension Field',
      _parametersPayload: [
        {
          id: 'field',
          name: 'Dimension Field',
          description: 'The field to be projected for this dimension',
          source: dataSourceName,
          type: 'ref',
          expression: INTRINSIC_VALUE_EXPRESSION,
          defaultValue,
          _localValues: fields.map((field) => ({
            id: field.name,
            description: undefined, // ignoring dimension field description for
            name: field.name,
          })),
        },
        {
          id: 'grain',
          name: 'Time Grain',
          description: 'The time grain to group dates by',
          source: dataSourceName,
          type: 'ref',
          expression: INTRINSIC_VALUE_EXPRESSION,
          defaultValue: grains[0],
          _localValues: grains.map((grain) => ({
            id: grain,
            // description: grain.description,
            name: grain,
          })),
        },
      ],
    };
    return this.createColumnFunctionModel(payload);
  }

  /**
   * Creates a column function consisting of the dimension fields
   * @param dimension - the dimension to extract fields from
   * @param dataSourceName - data source name
   */
  createDimensionFieldColumnFunction(
    dimension: RawDimensionPayload,
    dataSourceName: string
  ): ColumnFunctionMetadataModel {
    const { fields = [] } = dimension;
    const defaultValue =
      fields.find((field) => field.tags && field.tags.includes('primaryKey'))?.name || fields[0]?.name;
    const sorted = fields.map((field) => field.name).sort();
    const columnFunctionId = `${this.namespace}:dimensionField(fields=${sorted.join(',')})`;
    const payload: ColumnFunctionMetadataPayload = {
      id: columnFunctionId,
      name: 'Dimension Field',
      source: dataSourceName,
      description: 'Dimension Field',
      _parametersPayload: [
        {
          id: 'field',
          name: 'Dimension Field',
          description: 'The field to be projected for this dimension',
          source: dataSourceName,
          type: 'ref',
          expression: INTRINSIC_VALUE_EXPRESSION,
          defaultValue,
          _localValues: fields.map((field) => ({
            id: field.name,
            description: undefined, // ignoring dimension field description for
            name: field.name,
          })),
        },
      ],
    };
    return this.createColumnFunctionModel(payload);
  }

  /**
   * Constructs a fili dateTime as a timeDimension column specific to the given table
   * @param table - the table to create a dateTime for
   * @param dataSourceName - data source name
   */
  private createDateTime(
    table: RawTablePayload,
    timeGrainInfo: TableTimeGrainInfo,
    dataSourceName: string
  ): TimeDimensionMetadataModel {
    const id = `${table.name}.dateTime`;
    const payload: TimeDimensionMetadataPayload = {
      category: 'Date',
      description: undefined,
      fields: undefined,
      tableSource: undefined,
      id,
      name: 'Date Time',
      source: dataSourceName,
      isSortable: true,
      type: 'field',
      valueType: 'date',
      supportedGrains: timeGrainInfo.timeGrains.map(({ name }) => ({
        id: name,
        expression: '',
        grain: capitalize(name),
      })),
      timeZone: 'UTC',
    };
    return this.createTimeDimensionModel(payload);
  }

  /**
   * Constructs a request constraint that requires a date time column
   * @param table - the table to create a dateTime for
   * @param dataSourceName - data source name
   */
  private createRequiredDateTimeColumnConstraint(
    table: RawTablePayload,
    dataSourceName: string
  ): RequestConstraintMetadataModel {
    const id = `${table.name}.dateTime`;
    const payload: RequestConstraintMetadataPayload = {
      id: `${this.namespace}:requestConstraint(columns=${id})`,
      name: 'Date Time Column',
      description: `The request has a Date Time column.`,
      source: dataSourceName,
      type: 'existence',
      constraint: {
        property: 'columns',
        matches: {
          type: 'timeDimension',
          field: id,
        },
      },
    };
    return this.createConstraintModel(payload);
  }

  /**
   * Constructs a request constraint that requires a date time filter
   * @param table - the table to create a dateTime for
   * @param dataSourceName - data source name
   */
  private createRequiredDateTimeFilterConstraint(
    table: RawTablePayload,
    dataSourceName: string
  ): RequestConstraintMetadataModel {
    const id = `${table.name}.dateTime`;
    const payload: RequestConstraintMetadataPayload = {
      id: `${this.namespace}:requestConstraint(filters=${id})`,
      name: 'Date Time Filter',
      description: 'The request has a Date Time filter that specifies an interval.',
      source: dataSourceName,
      type: 'existence',
      constraint: {
        property: 'filters',
        matches: {
          type: 'timeDimension',
          field: id,
        },
      },
    };
    return this.createConstraintModel(payload);
  }

  /**
   * Normalize raw bard time grains
   */
  private normalizeTimeGrain(rawGrain: string): GrainWithAll {
    const grain = rawGrain.toLowerCase() as Grain;
    return 'week' === grain ? 'isoWeek' : grain; //bard's week is typically an iso week
  }

  /**
   * Creates a column function to select the time grains from a given table
   * @param table - the table to create a dateTime for
   * @param dataSourceName - data source name
   */
  private createTimeGrainColumnFunction(
    table: RawTablePayload,
    timeGrainInfo: TableTimeGrainInfo,
    dataSourceName: string
  ): ColumnFunctionMetadataModel {
    const grainIds = timeGrainInfo.timeGrains.map((g) => g.name);

    const grains = grainIds.join(',');
    const columnFunctionId = `${this.namespace}:timeGrain(table=${table.name};grains=${grains})`;
    let defaultValue;
    const { defaultTimeGrain } = config.navi;
    if (defaultTimeGrain && grainIds.includes(defaultTimeGrain)) {
      defaultValue = defaultTimeGrain;
    } else {
      defaultValue = grainIds[0];
    }
    const payload: ColumnFunctionMetadataPayload = {
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
          _localValues: timeGrainInfo.timeGrains.map((grain) => ({
            id: grain.name,
            description: grain.description,
            name: grain.longName,
          })),
        },
      ],
    };
    return this.createColumnFunctionModel(payload);
  }

  /**
   * @param metric - raw metrics
   * @param dataSourceName - data source name
   */
  private getColumnFunctionFromParameters(
    metric: RawMetricPayload,
    dataSourceName: string
  ): ColumnFunctionMetadataModel | null {
    const { parameters, metricFunctionId } = metric;

    //only if just `parameters` exists, since metricId take precedence
    if (parameters && !metricFunctionId) {
      const sorted = Object.keys(parameters).sort();
      const newColumnFunction: ColumnFunctionMetadataPayload = {
        id: `${this.namespace}:columnFunction(parameters=${sorted.join(',')})`,
        name: '',
        description: '',
        _parametersPayload: this.constructFunctionParameters(parameters, dataSourceName),
        source: dataSourceName,
      };
      return this.createColumnFunctionModel(newColumnFunction);
    }
    return null;
  }

  /**
   * @param parameters - raw function parameters
   * @param dataSourceName - data source name
   */
  private constructFunctionParameters(
    parameters: RawColumnFunctionArguments,
    dataSourceName: string
  ): FunctionParameterMetadataPayload[] {
    return Object.keys(parameters).map((paramName) => {
      const param = parameters[paramName];
      const { defaultValue, description } = param;

      const normalized: FunctionParameterMetadataPayload = {
        id: paramName,
        name: paramName,
        description,
        type: 'ref', // It will always be ref for our case because all our parameters have their valid values defined in a dimension or enum
        expression: param.type === 'dimension' ? `dimension:${param.dimensionName}` : INTRINSIC_VALUE_EXPRESSION,
        _localValues: param.type === 'enum' ? param.values : undefined,
        source: dataSourceName,
        defaultValue,
      };
      return normalized;
    });
  }

  /**
   * Defaults the supported grains to the day grain of the table in utc timezone
   * @param table - raw table
   * @param dimensions - raw dimensions
   * @param dataSourceName - data source name
   */
  private normalizeTimeDimensions(
    dimensions: RawDimensionPayload[],
    dataSourceName: string
  ): TimeDimensionMetadataModel[] {
    const payloads: TimeDimensionMetadataPayload[] = dimensions
      .map((dimension) => {
        const dimMetaPayload = this.normalizeDimensionPayloads([dimension], dataSourceName)[0];
        return [dimMetaPayload, dimension] as const;
      })
      .filter(([_normalized, original]) => original.datatype === 'date' || original.datatype === 'dateTime')
      .map<TimeDimensionMetadataPayload>(([normalized, original]) => {
        const grain = grainForDataType(original.datatype);
        const grains: Grain[] = grain ? [grain] : [];
        return {
          supportedGrains: grains.map((grain) => ({ id: grain, expression: '', grain: capitalize(grain) })),
          timeZone: 'utc',
          ...normalized,
          isSortable: true,
        };
      });
    return payloads.map(this.createTimeDimensionModel.bind(this));
  }

  /**
   * @param dimensions - raw dimensions
   * @param dataSourceName - data source name
   */
  private normalizeDimensions(dimensions: RawDimensionPayload[], dataSourceName: string): DimensionMetadataModel[] {
    const payloads = this.normalizeDimensionPayloads(dimensions, dataSourceName);
    return payloads.map(this.createDimensionModel.bind(this));
  }

  /**
   * @param dimensions - raw dimensions
   * @param dataSourceName - data source name
   */
  private normalizeDimensionPayloads(
    dimensions: RawDimensionPayload[],
    dataSourceName: string
  ): DimensionMetadataPayload[] {
    return dimensions.map((dimension) => {
      const {
        name,
        longName,
        description,
        category,
        datatype: valueType,
        storageStrategy,
        cardinality,
        fields,
      } = dimension;

      let dimCardinality: Cardinality;
      if (cardinality > MEDIUM_CARDINALITY) {
        dimCardinality = CARDINALITY_SIZES[2];
      } else if (cardinality > SMALL_CARDINALITY) {
        dimCardinality = CARDINALITY_SIZES[1];
      } else {
        dimCardinality = CARDINALITY_SIZES[0];
      }
      return {
        id: name,
        name: longName,
        category,
        description,
        valueType,
        isSortable: false,
        type: 'field',
        fields,
        tableSource: {
          suggestionColumns: fields?.map((field) => ({ id: name, parameters: { field: field.name } })),
        },
        cardinality: dimCardinality,
        storageStrategy: storageStrategy || null,
        source: dataSourceName,
        partialData: isNone(description),
      };
    });
  }

  /**
   * @param metrics - raw metrics
   * @param dataSourceName - data source name
   */
  private normalizeMetrics(metrics: RawMetricPayload[], dataSourceName: string): MetricMetadataModel[] {
    return metrics.map((metric) => {
      const { type: valueType, longName, name, description, category, metricFunctionId } = metric;
      const payload: MetricMetadataPayload = {
        id: name,
        name: longName,
        description,
        isSortable: true,
        type: 'field',
        valueType,
        source: dataSourceName,
        category,
        partialData: isNone(description),
        columnFunctionId: metricFunctionId,
      };
      return this.createMetricModel(payload);
    });
  }

  /**
   * @param columnFunctions - raw column functions
   * @param dataSourceName - data source name
   */
  private normalizeColumnFunctions(
    columnFunctions: RawColumnFunction[],
    dataSourceName: string
  ): ColumnFunctionMetadataModel[] {
    return columnFunctions.map((func) => {
      const { id, name, description, arguments: args } = func;
      const payload: ColumnFunctionMetadataPayload = {
        id,
        name,
        description,
        source: dataSourceName,
      };
      if (args) {
        payload._parametersPayload = this.constructFunctionParameters(args, dataSourceName);
      }
      return this.createColumnFunctionModel(payload);
    });
  }

  private supportedTypes = new Set<keyof MetadataModelMap>(['everything', 'metric', 'dimension', 'columnFunction']);

  normalize<K extends keyof MetadataModelMap>(
    type: K,
    rawPayload: TODO,
    dataSourceName: string
  ): MetadataModelMap[K] | undefined {
    assert(
      `BardMetadataSerializer only supports normalizing types: ${[...this.supportedTypes]}`,
      this.supportedTypes.has(type)
    );

    if ('everything' === type) {
      const normalized: MetadataModelMap['everything'] = this.normalizeEverything(rawPayload, dataSourceName);
      return normalized as MetadataModelMap[K];
    }

    if ('metric' === type) {
      const normalized: MetadataModelMap['metric'] = this.normalizeMetrics(rawPayload, dataSourceName);
      return normalized as MetadataModelMap[K];
    }

    if ('dimension' === type) {
      const normalized: MetadataModelMap['dimension'] = this.normalizeDimensions(rawPayload, dataSourceName);
      return normalized as MetadataModelMap[K];
    }

    if ('columnFunction' === type) {
      const normalized: MetadataModelMap['columnFunction'] = this.normalizeColumnFunctions(rawPayload, dataSourceName);
      return normalized as MetadataModelMap[K];
    }
    return undefined;
  }
}

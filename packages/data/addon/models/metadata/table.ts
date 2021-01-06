/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { upperFirst } from 'lodash-es';
import MetricMetadataModel from './metric';
import DimensionMetadataModel from './dimension';
import TimeDimensionMetadataModel from './time-dimension';
import CARDINALITY_SIZES from '../../utils/enums/cardinality-sizes';
import NaviMetadataService from 'navi-data/services/navi-metadata';

export type TimeGrain = {
  id: string;
  name: string;
};

// Shape passed to model constructor
export interface TableMetadataPayload {
  id: string;
  name: string;
  category?: string;
  description?: string;
  cardinality: typeof CARDINALITY_SIZES[number];
  isFact: boolean;
  metricIds: string[];
  dimensionIds: string[];
  timeDimensionIds: string[];
  source: string;
  timeGrainIds?: string[];
  tags?: string[];
}
// Shape of public properties on model
export interface TableMetadata {
  id: string;
  name: string;
  category?: string;
  description?: string;
  cardinality: typeof CARDINALITY_SIZES[number];
  isFact: boolean;
  metrics: MetricMetadataModel[];
  dimensions: DimensionMetadataModel[];
  timeDimensions: TimeDimensionMetadataModel[];
  source: string;
  timeGrains: TimeGrain[];
  tags: string[];
}

function isPresent<T>(t: T | undefined | null | void): t is T {
  return t !== undefined && t !== null;
}

export default class TableMetadataModel extends EmberObject implements TableMetadata, TableMetadataPayload {
  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

  @service
  private naviMetadata!: NaviMetadataService;

  /**
   * @param {string} id
   */
  id!: string;

  /**
   * @param {string} name
   */
  name!: string;

  /**
   * @param {string} description
   */
  description?: string;

  /**
   * @param {string} category
   */
  category?: string;

  /**
   * @param {CaridnalitySize} cardinality
   */
  cardinality!: typeof CARDINALITY_SIZES[number];

  /**
   * @param {boolean} isFact
   */
  isFact = true;

  /**
   * @property {string[]} metricIds - array of metric ids
   */
  metricIds!: string[];

  /**
   * @property {string[]} dimensionIds - array of dimension ids
   */
  dimensionIds!: string[];

  /**
   * @property {string[]} timeDimensionIds - array of time dimension ids
   */
  timeDimensionIds!: string[];

  /**
   * @param {Metric[]} metrics
   */
  get metrics(): MetricMetadataModel[] {
    return this.metricIds.map(id => this.naviMetadata.getById('metric', id, this.source)).filter(isPresent);
  }

  /**
   * @param {Dimension[]} dimensions
   */
  get dimensions(): DimensionMetadataModel[] {
    return this.dimensionIds.map(id => this.naviMetadata.getById('dimension', id, this.source)).filter(isPresent);
  }

  /**
   * @param {TimeDimension[]} timeDimensions
   */
  get timeDimensions(): TimeDimensionMetadataModel[] {
    return this.timeDimensionIds
      .map(id => this.naviMetadata.getById('timeDimension', id, this.source))
      .filter(isPresent);
  }

  /**
   * @param {string[]} tags
   */
  tags: string[] = [];

  /**
   * @property {string} source - the datasource this metadata is from.
   */
  source!: string;

  /**
   * @property {string[]} timeGrainIds - supported timegrains for a column
   */
  timeGrainIds: string[] = [];

  /**
   * @property {Object[]} timeGrains - timeGrain objects with id and display name
   */
  get timeGrains(): TimeGrain[] {
    return this.timeGrainIds.map(grain => {
      return {
        id: grain,
        name: upperFirst(grain)
      };
    });
  }
}

declare module './registry' {
  export default interface MetadataModelRegistry {
    table: TableMetadataModel;
  }
}

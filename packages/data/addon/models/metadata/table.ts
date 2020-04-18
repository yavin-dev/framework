/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { upperFirst } from 'lodash-es';
import Metric from './metric';
import KegService from '../../services/keg';
import Dimension from './dimension';
import TimeDimension from './time-dimension';
import CARDINALITY_SIZES from '../../utils/enums/cardinality-sizes';

export type TimeGrain = {
  id: string;
  name: string;
};

export default class Table extends EmberObject {
  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {KegService} keg
   */
  @service('keg')
  keg!: KegService;

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
  description!: string;

  /**
   * @param {string} category
   */
  category!: string;

  /**
   * @param {CaridnalitySize} cardinalitySize
   */
  cardinalitySize!: typeof CARDINALITY_SIZES[number];

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
  get metrics(): Metric[] {
    return this.metricIds.map(metricId => {
      const metric = this.keg.getById('metadata/metric', metricId, this.source);
      // force cast to metric
      return (metric as unknown) as Metric;
    });
  }

  /**
   * @param {Dimension[]} dimensions
   */
  get dimensions(): Dimension[] {
    return this.dimensionIds.map(dimensionId => {
      const dimension = this.keg.getById('metadata/dimension', dimensionId, this.source);
      // force cast to dimension
      return (dimension as unknown) as Dimension;
    });
  }

  /**
   * @param {TimeDimension[]} timeDimensions
   */
  get timeDimensions(): TimeDimension[] {
    return this.timeDimensionIds.map(dimensionId => {
      const timeDimension = this.keg.getById('metadata/time-dimension', dimensionId, this.source);
      // force cast to timeDimension
      return (timeDimension as unknown) as TimeDimension;
    });
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

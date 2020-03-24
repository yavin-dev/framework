/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';

export default class Table extends EmberObject {
  /**
   * @static
   * @property {String} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {Ember.Service} keg
   */
  @service('keg')
  keg;

  /**
   * @param {String} id
   */
  id;

  /**
   * @param {String} name
   */
  name;

  /**
   * @param {String} description
   */
  description;

  /**
   * @param {String} category
   */
  category;

  /**
   * @param {CaridnalitySize} cardinalitySize
   */
  cardinalitySize;

  /**
   * @property {Array} metricIds - array of metric ids
   */
  metricIds;

  /**
   * @property {Array} dimensionIds - array of dimension ids
   */
  dimensionIds;

  /**
   * @property {Array} timeDimensionIds - array of time dimension ids
   */
  timeDimensionIds;

  /**
   * @param {Metric[]} metrics
   */
  get metrics() {
    return this.metricIds.map(metricId => {
      return this.keg.getById('metadata/metric', metricId, this.source);
    });
  }

  /**
   * @param {Dimension[]} dimensions
   */
  get dimensions() {
    return this.dimensionIds.map(dimensionId => {
      return this.keg.getById('metadata/dimension', dimensionId, this.source);
    });
  }

  /**
   * @param {TimeDimension[]} timeDimensions
   */
  get timeDimensions() {
    return this.timeDimensionIds.map(dimensionId => {
      return this.keg.getById('metadata/time-dimension', dimensionId, this.source);
    });
  }

  /**
   * @param {String[]} tags
   */
  tags = [];

  /**
   * @property {String} source - the datasource this metadata is from.
   */
  source;

  /**
   * @property {String[]} timeGrainIds - supported timegrains for a column
   */
  timeGrainIds = [];

  /**
   * @property {Object[]} timeGrains - timeGrain objects with id and display name
   */
  get timeGrains() {
    return this.timeGrainIds.map(grain => {
      return {
        id: grain,
        name: `${grain.substr(0, 1).toUpperCase()}${grain.substr(1)}`
      };
    });
  }
}

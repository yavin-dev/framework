/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';

export default class Table extends EmberObject {
  /**
   * @static
   * @property {String} identifierField
   */
  static identifierField = 'id';

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
  @tracked
  metricIds;

  /**
   * @property {Array} dimensionIds - array of dimension ids
   */
  @tracked
  dimensionIds;

  /**
   * @property {Array} timeDimensionIds - array of time dimension ids
   */
  @tracked
  timeDimensionIds;

  /**
   * @param {Metric[]]} metrics
   */
  get metrics() {
    return this.metricIds.map(metricId => {
      return getOwner(this)
        .lookup('service:keg')
        .getById('metadata/metric', metricId, this.source);
    });
  }

  /**
   * @param {Dimension[]} dimensions
   */
  get dimensions() {
    return this.dimensionIds.map(dimensionId => {
      return getOwner(this)
        .lookup('service:keg')
        .getById('metadata/dimension', dimensionId, this.source);
    });
  }

  /**
   * @param {TimeDimension[]} timeDimensions
   */
  get timeDimensions() {
    return this.timeDimensionIds.map(dimensionId => {
      return getOwner(this)
        .lookup('service:keg')
        .getById('metadata/time-dimension', dimensionId, this.source);
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
}

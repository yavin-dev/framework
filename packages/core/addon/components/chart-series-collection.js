/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{chart-series-collection
 *      allSeriesData=allSeriesData
 *      selectedSeriesData=selectedSeriesData
 *      seriesDimensions=dimensions
 *      maxSeries=maxSeries
 *      onAddSeries=(action 'onAddSeriesAction')
 *      onRemoveSeries=(action 'onRemoveSeriesAction')
 *   }}
 */
import Ember from 'ember';
import layout from '../templates/components/chart-series-collection';
import { computedSetDiff } from 'navi-core/utils/custom-computed-properties';

const { computed, get } = Ember;
const DEFAULT_MAX_SERIES = 10;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['chart-series-collection'],

  /**
   * @property {Array} allSeriesData - array of all series data in the form:
   * [[{dimension: dimModel, value: {id: dimValueId, description: dimValDesc}}, ...], ...]
   */
  allSeriesData: undefined,

  /**
   * @property {Array} selectedSeriesData - array of selected series data in the form:
   * [[{dimension: dimModel, value: {id: dimValueId, description: dimValDesc}}, ...], ...]
   */
  selectedSeriesData: undefined,

  /**
   * @property {Array} availableSeriesData - array of available series data in the form:
   * [[{dimension: dimModel, value: {id: dimValueId, description: dimValDesc}}, ...], ...]
   */
  availableSeriesData: computedSetDiff('allSeriesData', 'selectedSeriesData'),

  /**
   * @property {Boolean} disableAdd - whether or not to disable adding series
   */
  disableAdd: computed('selectedSeriesData.length', function() {
    let maxSeries = get(this, 'maxSeries') || DEFAULT_MAX_SERIES;
    return get(this, 'selectedSeriesData.length') >= maxSeries;
  })
});

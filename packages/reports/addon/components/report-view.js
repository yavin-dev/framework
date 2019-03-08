/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{report-view
 *    report=report
 *    response=response
 *  }}
 */

import { readOnly } from '@ember/object/computed';

import { scheduleOnce, later } from '@ember/runloop';
import { capitalize } from '@ember/string';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { set, get, computed, observer } from '@ember/object';
import layout from '../templates/components/report-view';
import { DETAILS_DURATION } from '../transitions';

const VISUALIZATION_RESIZE_EVENT = 'resizestop';

export default Component.extend({
  layout,

  /**
   * @property {Number} warningAnimationDuration - amount of time in ms for missing intervals warning to expand
   */
  warningAnimationDuration: DETAILS_DURATION,

  /**
   * @property {Array} classNames
   */
  classNames: ['report-view'],

  /**
   * Property representing any data useful for providing additional functionality to a visualization and request
   * Acts a hook to be extended by other navi addons
   * @property {Promise} annotationData
   */
  annotationData: undefined,

  /**
   * @property {Object} request
   */
  request: readOnly('report.request'),

  /**
   * @property {Service} naviVisualizations - navi visualizations service
   */
  naviVisualizations: service(),

  /**
   * @property {Array} visualizations - array of available visualizations
   * annotated with a field corresponding to whether the visualization type is valid based on the request
   */
  validVisualizations: computed('response.rows', function() {
    return get(this, 'naviVisualizations').validVisualizations(get(this, 'report.request'));
  }),

  /**
   * @property {String} visualizationTypeLabel - Display name of the visualization type
   */
  visualizationTypeLabel: computed('report.visualization.type', function() {
    return get(this, 'report.visualization.type')
      .split('-')
      .map(capitalize)
      .join(' ');
  }),

  /**
   * @property {Boolean} isEditingVisualization - Display visualization config or not
   */
  isEditingVisualization: false,

  /**
   * @property {Boolean} hasMostRecentResponse - whether or not response matches the most recent version of report.request
   */
  hasMostRecentResponse: false,

  /**
   * @property {Boolean} hasNoData - whether or not there is data to display
   */
  hasNoData: computed('response.meta.pagination.numberOfResults', function() {
    return get(this, 'response.meta.pagination.numberOfResults') === 0;
  }),

  /**
   * @method didReceiveAttrs
   * @override
   */
  didReceiveAttrs() {
    this._super(...arguments);

    // Assume any new response is always the most recent
    set(this, 'hasMostRecentResponse', true);
  },

  /**
   * @method resizeVisualization
   */
  resizeVisualization() {
    if (this.$()) {
      this.$().trigger(VISUALIZATION_RESIZE_EVENT);
    }
  },

  /**
   * Observer that resizes the visualization when the number of filters change
   * since the filter and visualization share the same vertical space
   *
   * @method filterCountDidChange
   */
  filterCountDidChange: observer('report.request.{filters.[],having.[],intervals.[]}', function() {
    scheduleOnce('afterRender', this, 'resizeVisualization');
  }),

  actions: {
    /**
     * @action toggleEditVisualization
     */
    toggleEditVisualization() {
      this.toggleProperty('isEditingVisualization');
      scheduleOnce('afterRender', this, 'resizeVisualization');
    },

    /**
     * @action resizeVisualization
     */
    resizeVisualization(delay) {
      later(this, 'resizeVisualization', delay);
    }
  }
});

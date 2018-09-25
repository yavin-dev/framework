/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{report-visualization
 *    report=report
 *    response=response
 *  }}
 */

import Ember from 'ember';
import layout from '../templates/components/report-visualization';

const { computed, get, getOwner } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['report-visualization'],

  /**
   * Object representing the metadata required by the visualization
   * @property {Object} visualizationHash
   */
  visualizationHash: computed('report.request', 'response', function() {
    let request = get(this, 'report.request').serialize(), // Visualization wants serialized request
      response = get(this, 'response');

    return {
      request,
      response
    };
  }),

  /**
   * @property {String} visualizationComponent - name of the visualization component
   */
  visualizationComponent: computed('report.visualization.type', 'print', function() {
    let componentName = `navi-visualizations/${get(this, 'report.visualization.type')}`;
    if (get(this, 'print')) {
      let printComponent = `${componentName}-print`;
      if (getOwner(this).factoryFor(`component:${printComponent}`)) {
        componentName = printComponent;
      }
    }
    return componentName;
  })
});

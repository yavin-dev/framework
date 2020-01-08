/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{report-visualization
 *    report=report
 *    response=response
 *  }}
 */

import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { getOwner } from '@ember/application';
import layout from '../templates/components/report-visualization';

@templateLayout(layout)
@tagName('')
class ReportVisualization extends Component {
  /**
   * Object representing the metadata required by the visualization
   * @property {Object} visualizationHash
   */
  @computed('report.request', 'response')
  get visualizationHash() {
    let request = get(this, 'report.request').serialize(), // Visualization wants serialized request
      response = get(this, 'response') || { rows: [] };

    return {
      request,
      response
    };
  }

  /**
   * @property {String} visualizationComponent - name of the visualization component
   */
  @computed('report.visualization.type', 'print')
  get visualizationComponent() {
    const visType = get(this, 'report.visualization.type');
    if (visType === 'request-preview') {
      return 'navi-request-preview';
    }

    let componentName = `navi-visualizations/${visType}`;
    if (get(this, 'print')) {
      let printComponent = `${componentName}-print`;
      if (getOwner(this).factoryFor(`component:${printComponent}`)) {
        componentName = printComponent;
      }
    }
    return componentName;
  }
}

export default ReportVisualization;

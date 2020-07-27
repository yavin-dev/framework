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
import { computed } from '@ember/object';
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
    return {
      request: this.report.request,
      response: this.response || { rows: [] }
    };
  }

  /**
   * @property {String} visualizationComponent - name of the visualization component
   */
  @computed('report.visualization.type', 'print')
  get visualizationComponent() {
    const { type } = this.report.visualization;
    let componentName = `navi-visualizations/${type}`;
    if (this.print) {
      const printComponent = `${componentName}-print`;
      if (getOwner(this).factoryFor(`component:${printComponent}`)) {
        componentName = printComponent;
      }
    }
    return componentName;
  }
}

export default ReportVisualization;

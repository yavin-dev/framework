/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <VisualizationToggle
 *    @report={{this.report}}
 *    @validVisualizations={{this.validVisualizations}}
 *    @onVisualizationTypeUpdate={{this.onVisualizationTypeUpdate}}
 *  />
 */
import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface Args {
  report: any;
  validVisualizations: any[];
  onVisualizationTypeUpdate: () => void;
}

export default class VisualizationToggle extends Component<Args> {
  @computed('args.{report.visualization,validVisualizations}')
  get activeVisualization() {
    const { type: reportType } = this.args.report.visualization;
    return this.args.validVisualizations.find(({ name }) => name === reportType);
  }

  //
  // Name of the toggle that is clicked
  //
  @tracked clickedVisualization = this.args.report.visualization.name;
}

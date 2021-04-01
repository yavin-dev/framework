/**
 * Copyright 2021, Yahoo Holdings Inc.
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
import type ReportModel from 'navi-core/models/report';
import type NaviVisualizationBaseManifest from 'navi-core/navi-visualization-manifests/base';

interface Args {
  report: ReportModel;
  validVisualizations: NaviVisualizationBaseManifest[];
  onVisualizationTypeUpdate: (name: string) => void;
}

export default class VisualizationToggle extends Component<Args> {
  @computed('args.{report.visualization.type,validVisualizations}')
  get activeVisualization() {
    const { type: reportType } = this.args.report.visualization;
    return this.args.validVisualizations.find(({ name }) => name === reportType);
  }
}

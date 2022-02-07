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
import type ReportModel from 'navi-core/models/report';
import type { YavinVisualizationManifest } from 'navi-core/visualization/manifest';

interface Args {
  report: ReportModel;
  validVisualizations: YavinVisualizationManifest[];
  onVisualizationTypeUpdate: (name: string) => void;
}

export default class VisualizationToggle extends Component<Args> {
  get activeVisualization() {
    return this.args.report.visualization.manifest;
  }
}

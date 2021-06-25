/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { VisualizationModel } from './table';
import { PieChartConfig } from 'navi-core/models/pie-chart';
import { featureFlag } from 'navi-core/helpers/feature-flag';

export type PieChartOptions = PieChartConfig['metadata'];

export type Args = {
  model: VisualizationModel;
  options: PieChartOptions;
};

export default class NaviVisualizationsPieChartComponent extends Component {
  get isApexEnabled(): boolean {
    return true;
  }
}

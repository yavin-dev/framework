/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 */
import Component from '@glimmer/component';
import { BaseChartBuilder } from '../../chart-builders/base';
import TimeChartBuilder from '../../chart-builders/date-time';
import DimensionChartBuilder from '../../chart-builders/dimension';
import MetricChartBuilder from '../../chart-builders/metric';

export default class ChartBuildersBase<Args> extends Component<Args> {
  get chartBuilders(): Record<string, BaseChartBuilder | undefined> {
    return {
      metric: new MetricChartBuilder(),
      dimension: new DimensionChartBuilder(),
      dateTime: new TimeChartBuilder(),
    };
  }
}

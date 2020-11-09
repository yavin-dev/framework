/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 */
import Component from '@glimmer/component';
import config from 'ember-get-config';
import { getOwner } from '@ember/application';
import { camelize } from '@ember/string';
import { BaseChartBuilder } from 'navi-core/chart-builders/base';

// eslint-disable-next-line no-undef
const global = window as Window & typeof globalThis & { requirejs: { entries: Record<string, unknown> } };
export default class ChartBuildersBase<Args> extends Component<Args> {
  /**
   * map of chart type to builder
   */
  get chartBuilders() {
    // Find all chart builders registered in requirejs under the namespace "chart-builders"
    const builderRegExp = new RegExp(`^${config.modulePrefix}/chart-builders/(.*)`);
    const chartBuilderEntries = Object.keys(global.requirejs.entries).filter(key => builderRegExp.test(key));

    const owner = getOwner(this);
    const builderMap = chartBuilderEntries.reduce((map: Record<string, BaseChartBuilder | undefined>, builderName) => {
      const [, chartBuilder] = builderRegExp.exec(builderName) || [];
      const builderKey = camelize(chartBuilder);
      map[builderKey] = owner.lookup(`chart-builder:${builderKey}`);
      return map;
    }, {});
    return builderMap;
  }
}

/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 */
import Component from '@glimmer/component';
import config from 'ember-get-config';
import { getOwner } from '@ember/application';
import { camelize } from '@ember/string';
/* global requirejs */
export default class ChartBuildersBase<Args> extends Component<Args> {
  /**
   * map of chart type to builder
   */
  get chartBuilders() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = (requirejs as any).entries as Record<string, unknown>;
    // Find all chart builders registered in requirejs under the namespace "chart-builders"

    const builderRegExp = new RegExp(`^${config.modulePrefix}/chart-builders/(.*)`);
    const chartBuilderEntries = Object.keys(entries).filter(key => builderRegExp.test(key));

    const owner = getOwner(this);
    const builderMap = chartBuilderEntries.reduce((map: Record<string, TODO | undefined>, builderName) => {
      const [, chartBuilder] = builderRegExp.exec(builderName) || [];
      const builderKey = camelize(chartBuilder);
      map[builderKey] = owner.lookup(`chart-builder:${builderKey}`);
      return map;
    }, {});
    return builderMap;
  }
}

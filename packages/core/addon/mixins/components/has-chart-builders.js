/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 */
import Mixin from '@ember/object/mixin';
import config from 'ember-get-config';
import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
import { camelize } from '@ember/string';

/* global requirejs */

export default Mixin.create({
  /**
   * @property {Object} chartBuilders - map of chart type to builder
   */
  chartBuilders: computed(function() {
    // Find all chart builders registered in requirejs under the namespace "chart-builders"
    const modules = Object.keys(requirejs.entries),
      builderRegExp = new RegExp(`^${config.modulePrefix}/chart-builders/(.*)`),
      chartBuilderEntries = modules.filter(key => builderRegExp.test(key)),
      owner = getOwner(this),
      builderMap = chartBuilderEntries.reduce((map, builderName) => {
        const builderKey = camelize(builderRegExp.exec(builderName)[1]);

        map[builderKey] = owner.lookup(`chart-builder:${builderKey}`);
        return map;
      }, {});

    return builderMap;
  })
});

/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{dashboard-dimension-selector
 *      dashboard=dashboardModel
 *      onChange=(action changeAction)
 *   }}
 */
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import layout from '../templates/components/dashboard-dimension-selector';

export default Component.extend({
  layout,
  classNames: ['dashboard-dimension-selector'],

  /**
   * @property {Promise} -- creates powerselect options of all dimensions that can be pick based on widgets on the dashboard
   */
  groupedDimensions: computed('dashboard', 'dashboard.widgets', function() {
    const widgetPromises = get(this, 'dashboard.widgets');
    /*
     * get a list of dimensions per table/timeGrain involved
     * do this so each table/timegrain combination is unique and we don't have to flatten more than we have to.
     * shape will be: {table: [{name, longName, category}, ...], ...}
     */
    return widgetPromises.then(this.mergeWidgetDimensions).then(dimensionMap => {
      /*
       * merge and build category: dimension map
       * shape will be: {categoryName: {dimensionName: {dimension, longName, tables}, ...}, ....}
       */
      const dimObject = this.buildCategoryMap(dimensionMap);

      /*
       * transform into powerselect friendly option
       * shape will be [{groupName, options: [{dimension, longName, tables}, ...]}, ...]
       */
      const selectOptions = this.buildPowerSelectOptions(dimObject);

      //sort groups
      selectOptions.sort((a, b) => a.groupName.localeCompare(b.groupName));
      return selectOptions;
    });
  }),

  /**
   * Takes category mapped dimension objects and maps it to power-select grouped list
   * @param {Object} dimObject - {categoryName: {dimensionName: {dimension, longName, tables}, ...}, ....}
   * @returns {Object} - [{groupName, options: [{dimension, longName, tables}, ...]}, ...]
   */
  buildPowerSelectOptions(dimObject) {
    return Object.entries(dimObject).reduce((selectOptions, [category, dimensions]) => {
      dimensions = Object.values(dimensions);
      dimensions.sort((a, b) => a.longName.localeCompare(b.longName));
      selectOptions.push({ groupName: category, options: dimensions });
      return selectOptions;
    }, []);
  },

  /**
   * Takes an object that is mapped by table and list of dimensions, and merges them into a object
   * that is keyed by {category: [dimensions]}
   * @param {Object} dimensionMap - {table: [{name, longName, category}, ...], ...}
   * @return {Object} - {categoryName: {dimensionName: {dimension, longName, tables}, ...}, ....}
   */
  buildCategoryMap(dimensionMap) {
    return Object.entries(dimensionMap).reduce((results, [table, dimensions]) => {
      dimensions.forEach(dimension => {
        if (!results[dimension.category]) {
          results[dimension.category] = {};
        }

        if (!results[dimension.category][dimension.name]) {
          results[dimension.category][dimension.name] = {
            dimension: dimension.name,
            longName: dimension.longName,
            tables: [table]
          };
        } else {
          results[dimension.category][dimension.name].tables.push(table);
        }
      });
      return results;
    }, {});
  },

  /**
   * Takes a list of widgets and builds an object keyed by table and list of dimensions
   * @param {Widget} widgets
   * @returns {Object} - {table: [{name, longName, category}, ...], ...}
   */
  mergeWidgetDimensions(widgets) {
    return widgets.reduce((dimensionMap, widget) => {
      const tableKey = get(widget, 'requests.firstObject.logicalTable.table.name');
      const timeGrain = get(widget, 'requests.firstObject.logicalTable.timeGrain');
      if (!dimensionMap[tableKey]) {
        dimensionMap[tableKey] = get(timeGrain, 'dimensions');
      }
      return dimensionMap;
    }, {});
  },

  actions: {
    /**
     * Action on selector change.
     *
     * @action
     * @param  {...any} args
     */
    change(...args) {
      const handleChange = get(this, 'onChange');

      if (handleChange) handleChange(...args);
    }
  }
});

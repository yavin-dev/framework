/**
 * Copyright 2020, Yahoo Holdings Inc.
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
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import { groupBy } from 'lodash-es';

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
      dimensions = groupBy(Object.values(dimensions), 'dataSource');
      const needsDatasourceSpecifier = Object.keys(dimensions).length > 1;
      Object.entries(dimensions).forEach(([dataSource, dims]) => {
        dims.sort((a, b) => a.longName.localeCompare(b.longName));
        selectOptions.push({
          groupName: needsDatasourceSpecifier ? `${category} (${dataSource})` : category,
          options: dims
        });
      });
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
      let dataSource = getDefaultDataSourceName();
      if (table.includes('.')) {
        [dataSource, ...table] = table.split('.');
        table = table.join('.');
      }

      dimensions.forEach(dimension => {
        if (!results[dimension.category]) {
          results[dimension.category] = {};
        }

        if (!results[dimension.category][`${dataSource}.${dimension.name}`]) {
          results[dimension.category][`${dataSource}.${dimension.name}`] = {
            dimension: dimension.name,
            longName: dimension.longName,
            tables: [table],
            dataSource
          };
        } else {
          results[dimension.category][`${dataSource}.${dimension.name}`].tables.push(table);
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
      const tableKey = widget?.requests?.firstObject?.logicalTable?.table?.name;
      const timeGrain = widget?.requests?.firstObject?.logicalTable?.timeGrain;
      const dataSource = widget?.requests?.firstObject?.dataSource || getDefaultDataSourceName();
      if (!dimensionMap[tableKey]) {
        dimensionMap[`${dataSource}.${tableKey}`] = timeGrain.dimensions;
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

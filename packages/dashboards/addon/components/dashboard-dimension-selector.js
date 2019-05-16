/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 *  * Usage:
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
  /**
   * @property {Promise} -- creates powerselect options of all dimensions that can be pick based on widgets on the dashboard
   */
  groupedDimensions: computed('dashboard', 'dashboard.widgets', function() {
    const widgetPromises = get(this, 'dashboard.widgets');
    /*
     * get a list of dimensions per table/timeGrain involved
     * do this so each table/timegrain combination is unique and we don't have to flatten more than we have to.
     * shape will be: {table+timeGrain: [{name, longName, catetory}, ...], ...}
     */
    return widgetPromises
      .then(widgets =>
        widgets.reduce((dimensionMap, widget) => {
          const tableKey = get(widget, 'requests.firstObject.logicalTable.table.name');
          const timeGrain = get(widget, 'requests.firstObject.logicalTable.timeGrain');
          if (!dimensionMap[tableKey]) {
            dimensionMap[tableKey] = get(timeGrain, 'dimensions');
          }
          return dimensionMap;
        }, {})
      )
      .then(dimensionMap => {
        /*
         * merge and build category: dimension map
         * shape will be: {categoryName: {dimensionName: {dimension, longName, tables}, ...}, ....}
         */
        const dimObject = Object.entries(dimensionMap).reduce((results, [table, dimensions]) => {
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

        /*
         * transform into powerselect friendly option
         * shape will be [{groupName, options: [{dimension, longName, tables}, ...]}, ...]
         */
        const selectOptions = Object.entries(dimObject).reduce((selectOptions, [category, dimensions]) => {
          dimensions = Object.values(dimensions);
          dimensions.sort((a, b) => a.longName.localeCompare(b.longName));
          selectOptions.push({ groupName: category, options: dimensions });
          return selectOptions;
        }, []);

        //sort groups
        selectOptions.sort((a, b) => a.groupName.localeCompare(b.groupName));
        return selectOptions;
      });
  }),

  actions: {
    change(e) {
      this.onChange(e);
    }
  }
});

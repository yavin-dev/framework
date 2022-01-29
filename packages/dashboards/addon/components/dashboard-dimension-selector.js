/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <DashboardDimensionSelector
 *      @dashboard={{this.dashboardModel}}
 *      @onChange={{this.changeAction}}
 *   />
 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/dashboard-dimension-selector';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import { groupBy } from 'lodash-es';

@templateLayout(layout)
@tagName('')
export default class DashboardDimensionSelectorComponent extends Component {
  /**
   * @property {Promise} -- creates powerselect options of all dimensions that can be pick based on widgets on the dashboard
   */
  @computed('dashboard.{widgets.[],filters.[]}', 'mergeWidgetDimensions')
  get groupedDimensions() {
    const { widgets: widgetPromises, filters: dashboardFilters } = this.dashboard;
    /*
     * get a list of dimensions per table/timeGrain involved
     * do this so each table/timegrain combination is unique and we don't have to flatten more than we have to.
     * shape will be: {table: [{id, name, category}, ...], ...}
     */
    return widgetPromises
      .then((widgets) => this.mergeWidgetDimensions(widgets, dashboardFilters))
      .then((dimensionMap) => {
        /*
         * merge and build category: dimension map
         * shape will be: {categoryName: {dimensionName: {dimension, name, tables}, ...}, ....}
         */
        const dimObject = this.buildCategoryMap(dimensionMap);

        /*
         * transform into powerselect friendly option
         * shape will be [{groupName, options: [{dimension, name, tables}, ...]}, ...]
         */
        const selectOptions = this.buildPowerSelectOptions(dimObject);

        //sort groups
        selectOptions.sort((a, b) => a.groupName.localeCompare(b.groupName));
        return selectOptions;
      });
  }

  /**
   * Takes category mapped dimension objects and maps it to power-select grouped list
   * @param {Object} dimObject - {categoryName: {dimensionName: {dimension, name, tables}, ...}, ....}
   * @returns {Object} - [{groupName, options: [{dimension, name, tables}, ...]}, ...]
   */
  buildPowerSelectOptions(dimObject) {
    return Object.entries(dimObject).reduce((selectOptions, [category, dimensions]) => {
      dimensions = groupBy(Object.values(dimensions), 'source');
      const needsDatasourceSpecifier = Object.keys(dimensions).length > 1;
      Object.entries(dimensions).forEach(([dataSource, dims]) => {
        dims.sort((a, b) => a.name.localeCompare(b.name));
        selectOptions.push({
          groupName: needsDatasourceSpecifier ? `${category} (${dataSource})` : category,
          options: dims,
        });
      });
      return selectOptions;
    }, []);
  }

  /**
   * Takes an object that is mapped by table and list of dimensions, and merges them into a object
   * that is keyed by {category: [dimensions]}
   * @param {Object} dimensionMap - {table: [{id, name, category}, ...], ...}
   * @return {Object} - {categoryName: {dimensionName: {dimension, name, tables}, ...}, ....}
   */
  buildCategoryMap(dimensionMap) {
    return Object.entries(dimensionMap).reduce((results, [table, dimensions]) => {
      let dataSource = getDefaultDataSourceName();
      if (table.includes('.')) {
        /**
         * table might be:
         * dataSource.table (fili/elide)
         * dataSource.namespace.table (elide)
         */
        const split = table.split('.');
        table = split.pop();
        dataSource = split.join('.');
      }

      dimensions.forEach((dimension) => {
        if (!results[dimension.category]) {
          results[dimension.category] = {};
        }

        if (!results[dimension.category][`${dataSource}.${dimension.id}`]) {
          results[dimension.category][`${dataSource}.${dimension.id}`] = {
            type: dimension.metadataType,
            field: dimension.id,
            name: dimension.name,
            tables: [table],
            source: dataSource,
          };
        } else {
          results[dimension.category][`${dataSource}.${dimension.id}`].tables.push(table);
        }
      });
      return results;
    }, {});
  }

  /**
   * Takes a list of widgets and current dashboard filters and builds an object keyed by table and list of dimensions
   * Excludes timeDimensions which are already filtered on
   * @param {Widget} widgets
   * @returns {Object} - {table: [{id, name, category}, ...], ...}
   */
  mergeWidgetDimensions(widgets, dashboardFilters) {
    const timeFilters = (dashboardFilters ?? []).filter((filter) => filter.type === 'timeDimension');

    return widgets.reduce((dimensionMap, widget) => {
      const { id: tableKey, dimensions, timeDimensions } = widget.requests?.firstObject?.tableMetadata || {};
      const dataSource = widget?.requests?.firstObject?.dataSource;
      const key = `${dataSource}.${tableKey}`;
      if (!dimensionMap[key]) {
        dimensionMap[key] = [
          ...(dimensions ?? []),
          ...(timeDimensions ?? []).filter(
            (timeDimension) =>
              !timeFilters.find((filter) => filter.source === dataSource && filter.field === timeDimension.id)
          ),
        ];
      }
      return dimensionMap;
    }, {});
  }
}

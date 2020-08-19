/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import { get } from '@ember/object';
import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';
import ReportsNewRoute from 'navi-reports/routes/reports/new';

export default ReportsNewRoute.extend({
  /**
   * Transitions to newly created widget
   *
   * @method afterModel
   * @param {DS.Promise} widget - resolved widget model
   * @override
   */
  afterModel(widget) {
    return this.replaceWith('dashboards.dashboard.widgets.widget.edit', get(widget, 'tempId'));
  },

  /**
   * Returns a new model for this route
   *
   * @method _newModel
   * @private
   * @returns {Promise} route model
   */
  _newModel() {
    let dashboard = this.modelFor('dashboards.dashboard');

    return get(this, 'user')
      .findOrRegister()
      .then(author => {
        // Default to first data source + time grain
        let table = this._getDefaultTable(),
          timeGrain = table.timeGrains?.[0]?.id;

        let widget = this.store.createRecord('dashboard-widget', {
          author,
          dashboard,
          requests: A([
            {
              filters: A([
                {
                  type: 'timeDimension',
                  field: `${table.id}.dateTime`,
                  parameters: {
                    grain: timeGrain
                  },
                  operator: 'bet',
                  values: [DefaultIntervals[timeGrain], 'current']
                }
              ]),
              table: table.id,
              dataSource: table.source,
              responseFormat: 'csv'
            }
          ]),
          visualization: { type: 'table' }
        });

        return widget;
      });
  }
});

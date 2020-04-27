/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import { get } from '@ember/object';
import Interval from 'navi-data/utils/classes/interval';
import Duration from 'navi-data/utils/classes/duration';
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
              logicalTable: {
                table,
                timeGrain
              }
            }
          ]),
          visualization: { type: 'table' }
        });

        get(widget, 'request.intervals').createFragment({
          interval: new Interval(new Duration(DefaultIntervals[timeGrain]), 'current')
        });

        return widget;
      });
  }
});

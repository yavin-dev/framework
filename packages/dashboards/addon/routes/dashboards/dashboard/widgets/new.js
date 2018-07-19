/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';
import ReportsNewRoute from 'navi-reports/routes/reports/new';

const { get } = Ember;

export default ReportsNewRoute.extend({
  /**
   * Transitions to newly created widget
   *
   * @method afterModel
   * @param {DS.Promise} widget - resolved widget model
   * @override
   */
  afterModel(widget) {
    return this.replaceWith(
      'dashboards.dashboard.widgets.widget.new',
      get(widget, 'tempId')
    );
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
          tableTimeGrains = Ember.A(get(table, 'timeGrains')),
          timeGrainName = get(tableTimeGrains, 'firstObject.name');

        let widget = this.store.createRecord('dashboard-widget', {
          author,
          dashboard,
          requests: Ember.A([
            {
              logicalTable: {
                table,
                timeGrainName
              }
            }
          ]),
          visualization: { type: 'line-chart' }
        });

        get(widget, 'request.intervals').createFragment({
          interval: new Interval(
            new Duration(DefaultIntervals[timeGrainName]),
            'current'
          )
        });

        return widget;
      });
  }
});

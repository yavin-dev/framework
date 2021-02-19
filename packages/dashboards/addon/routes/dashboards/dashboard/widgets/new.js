/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import { get } from '@ember/object';
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

    return this.user.findOrRegister().then((author) => {
      const defaultVisualization = get(this, 'naviVisualizations').defaultVisualization();
      const table = this._getDefaultTable();

      const widget = this.store.createRecord('dashboard-widget', {
        author,
        dashboard,
        requests: A([
          this.store.createFragment('bard-request-v2/request', {
            table: table.id,
            dataSource: table.source,
          }),
        ]),
        visualization: { type: defaultVisualization },
      });

      return widget;
    });
  },
});

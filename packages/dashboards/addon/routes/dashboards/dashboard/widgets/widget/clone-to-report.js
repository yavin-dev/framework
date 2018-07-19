/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';

const { get } = Ember;

export default Ember.Route.extend({
  /**
   * @property {Service} user
   */
  user: Ember.inject.service(),

  /**
   * @method model
   * @returns {DS.Model} report model
   */
  model() {
    let widget = this.modelFor('dashboards.dashboard.widgets.widget');
    return this._cloneToReport(widget);
  },

  /**
   * Transitions to newly created report
   *
   * @method afterModel
   * @param report - resolved report model
   * @override
   */
  afterModel(report) {
    return this.replaceWith('reports.report.view', get(report, 'tempId'));
  },

  /**
   * Convert a widget to a report
   *
   * @method _cloneToReport
   * @private
   * @param {DS.Model} widget - the widget to clone
   * @returns {DS.Model} report model from widget
   */
  _cloneToReport(widget) {
    let clonedWidget = widget.toJSON();

    return this.store.createRecord('report', {
      title: `Copy of ${clonedWidget.title}`.substring(0, 150),
      author: get(this, 'user').getUser(),
      request: get(widget, 'request').clone(),
      visualization: this.store.createFragment(
        clonedWidget.visualization.type,
        clonedWidget.visualization
      )
    });
  }
});

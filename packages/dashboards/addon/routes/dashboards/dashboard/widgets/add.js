/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { reject } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { set, get } from '@ember/object';

export default Route.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * Saves new widget to dashboard
   *
   * @method model
   * @override
   */
  model(params) {
    let id = params.unsavedWidgetId,
      dashboard = this.modelFor('dashboards.dashboard');

    if (id) {
      let widget = this.store.peekAll('dashboard-widget').findBy('tempId', id);

      if (widget) {
        widget.set('dashboard', dashboard);

        return widget.save().then(({ id }) => {
          let layout = get(dashboard, 'presentation.layout'),
            newLayout = this._addToLayout(layout, Number(id));

          set(dashboard, 'presentation.layout', newLayout);
        });
      } else {
        return reject('Unable to find unsaved widget');
      }
    }
  },

  /**
   * Transitions to dashboard
   *
   * @method afterModel
   * @override
   */
  afterModel() {
    let { id } = this.modelFor('dashboards.dashboard');
    return this.replaceWith('dashboards.dashboard', id);
  },

  /**
   * Returns a shallow copy of the layout with the
   * new widget added
   *
   * @method _addToLayout
   * @private
   * @param {Array} layout - dashboard layout array
   * @param {Number} widgetId - id of widget to add
   * @returns {Array} new layout with new widget
   */
  _addToLayout(layout, widgetId) {
    let row = this._findNextAvailableRow(layout);
    return [
      ...layout,
      {
        widgetId: Number(widgetId),
        width: 5,
        height: 4,
        column: 0,
        row
      }
    ];
  },

  /**
   * Finds the next available row in a dashboard
   *
   * @method _findNextAvailableRow
   * @private
   * @param {Array} layout - dashboard layout array
   * @returns {Number} next available row number
   */
  _findNextAvailableRow(layout) {
    let nextRow = 0;
    layout.forEach(widget => {
      let { row, height } = widget;
      if (row + height > nextRow) {
        nextRow = row + height;
      }
    });
    return nextRow;
  },

  actions: {
    /**
     * @action error
     * action to handle errors in route
     */
    error() {
      get(this, 'naviNotifications').add({
        message: 'OOPS! An error occurred while creating a new widget.',
        type: 'danger',
        timeout: 'short'
      });
      this.replaceWith('dashboards');
    }
  }
});

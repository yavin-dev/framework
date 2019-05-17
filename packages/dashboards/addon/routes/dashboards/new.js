/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * @property {Service} user
   */
  user: service(),

  /**
   * Sets the model for this route
   *
   * @method model
   * @override
   * @param title - query param containing the title of dashboard
   * @returns {DS.Model} route model
   */
  model(pathParams, { queryParams }) {
    queryParams = queryParams || {};
    return this._newModel(queryParams.title);
  },

  /**
   * Transitions to dashboard
   *
   * @method afterModel
   * @param dashboard - resolved dashboard model
   * @override
   */
  afterModel(dashboard, { queryParams }) {
    // If an initial widget was given in the query params, create it
    if (queryParams.unsavedWidgetId) {
      return this.replaceWith('dashboards.dashboard.widgets.add', get(dashboard, 'id'), { queryParams });
    } else {
      return this.replaceWith('dashboards.dashboard', get(dashboard, 'id'));
    }
  },

  /**
   * Returns a new model for this route
   *
   * @method _newModel
   * @private
   * @param title - Containing Title of the dashboard, with default value
   * @returns {DS.Model} route model
   */
  _newModel(title = 'Untitled Dashboard') {
    return get(this, 'user')
      .findOrRegister()
      .then(author =>
        this.store
          .createRecord('dashboard', {
            author,
            title
          })
          .save()
      );
  },

  actions: {
    /**
     * @action error
     * action to handle errors in route
     */
    error() {
      let message = 'OOPS! An error occurred while creating a new dashboard.';
      get(this, 'naviNotifications').add({
        message,
        type: 'danger',
        timeout: 'short'
      });
      this.replaceWith('dashboards');
    }
  }
});

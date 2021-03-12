/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { A } from '@ember/array';
import { hash } from 'rsvp';
import EmberObject, { computed, action } from '@ember/object';
import DS from 'ember-data';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type UserService from 'navi-core/services/user';
import type UserModel from 'navi-core/models/user';
import type DashboardModel from 'navi-core/models/dashboard';

/**
 * Object that computes a combined dashboard list
 * @private
 */
class DashboardObject extends EmberObject {
  declare userDashboards: UserModel['dashboards'];
  declare favoriteDashboards: UserModel['favoriteDashboards'];

  /**
   * Returns a combined report list while listening to store changes
   */
  @computed('userDashboards.[]', 'favoriteDashboards.[]')
  get dashboards(): DS.PromiseArray<DashboardModel> {
    const dashboardsPromise = hash({
      userDashboards: this.userDashboards,
      favoriteDashboards: this.favoriteDashboards,
    });
    //@ts-ignore
    return DS.PromiseArray.create({
      promise: dashboardsPromise.then(({ userDashboards, favoriteDashboards }) => {
        return A().pushObjects(A(userDashboards.toArray())).pushObjects(A(favoriteDashboards.toArray())).uniq();
      }),
    }) as DS.PromiseArray<DashboardModel>;
  }
}

export default class DashboardsIndexRoute extends Route {
  @service declare naviNotifications: NaviNotificationsService;

  @service declare user: UserService;

  /**
   * @override
   * @returns  an array of dashboard models
   */
  async model() {
    const userModel = await this.user.findOrRegister();
    const { dashboards: userDashboards, favoriteDashboards } = userModel;
    return DashboardObject.create({ userDashboards, favoriteDashboards });
  }

  /**
   * action to handle errors in route
   */
  @action
  error() {
    this.naviNotifications.add({
      title: 'An error occurred while retrieving user settings',
      context: 'Some functionality may be limited',
      style: 'danger',
      timeout: 'medium',
    });
  }
}

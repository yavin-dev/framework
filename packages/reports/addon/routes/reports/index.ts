/**
 * Copyright 2018, Yahoo Holdings Inc.
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
import type ReportModel from 'navi-core/models/report';

/**
 * Object that computes a combined report list
 */
class ReportObject extends EmberObject {
  declare userReports: UserModel['reports'];
  declare favoriteReports: UserModel['favoriteReports'];

  /**
   * Returns a combined report list while listening to store changes
   */
  @computed('userReports.[]', 'favoriteReports.[]')
  get reports(): DS.PromiseArray<ReportModel> {
    const reportsPromise = hash({ userReports: this.userReports, favoriteReports: this.favoriteReports });
    //@ts-ignore
    return DS.PromiseArray.create({
      promise: reportsPromise.then(({ userReports, favoriteReports }) => {
        return A().pushObjects(A(userReports.toArray())).pushObjects(A(favoriteReports.toArray())).uniq();
      }),
    }) as DS.PromiseArray<ReportModel>;
  }
}

export default class ReportsIndexRoute extends Route {
  @service declare naviNotifications: NaviNotificationsService;

  @service declare user: UserService;

  /**
   * Sets the model for this route
   *
   * @override
   * @returns contains an array of report models
   */
  model() {
    return this.user.findOrRegister().then((userModel) => {
      const { reports: userReports, favoriteReports } = userModel;
      return ReportObject.create({ userReports, favoriteReports });
    });
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

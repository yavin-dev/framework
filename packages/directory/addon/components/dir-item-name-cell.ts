/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This component won't be used directly. It is passed to ember-light-table as a custom cell component.
 * Ember-light-table will pass any parameters in through the value attribute.
 *
 * <DirItemNameCell
 *  @value={{@item}}
 * />
 */
import Component from '@glimmer/component';
import { pluralize } from 'ember-inflector';
import { inject as service } from '@ember/service';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type UserService from 'navi-core/services/user';
import ReportModel from 'navi-core/models/report';
import DashboardModel from 'navi-core/models/dashboard';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
interface DirItemNameCellComponentArgs {
  value: ReportModel | DashboardModel;
}

export default class DirItemNameCellComponent extends Component<DirItemNameCellComponentArgs> {
  @service declare user: UserService;
  @service declare naviNotifications: NaviNotificationsService;

  /**
   * @property {String} itemLink - the route that this component should link to (without the id)
   */
  get itemLink() {
    const { type } = this;
    return `${pluralize(type)}.${type}`;
  }

  /**
   * @property {String} itemId - the id of the model or the tempId of an unsaved model
   */
  get itemId() {
    return this.args.value?.modelId;
  }

  /**
   * @property {String} type - the type of the item
   */
  get type() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    //@ts-ignore (ember data generates this field)
    return this.args.value?.constructor?.modelName;
  }

  @action
  toggleFavorite(isFavorite: boolean) {
    const user = this.user.getUser();
    assert('User is found', user);
    const updateOperation = isFavorite ? 'removeObject' : 'addObject';
    const rollbackOperation = isFavorite ? 'addObject' : 'removeObject';

    // if this is a report, update user favoriteReports
    if (this.args.value instanceof ReportModel) {
      const report = this.args.value;
      user.favoriteReports[updateOperation](report);
      user.save().catch(() => {
        //manually rollback - fix once ember-data has a way to rollback relationships
        user.favoriteReports[rollbackOperation](report);
        this.naviNotifications.add({
          title: 'An error occurred while updating favorite reports',
          style: 'danger',
          timeout: 'medium',
        });
      });
    }

    // if this is a dashboard, update user favoriteDashboards
    else if (this.args.value instanceof DashboardModel) {
      const dashboard = this.args.value;
      user.favoriteDashboards[updateOperation](dashboard);
      user.save().catch(() => {
        //manually rollback - fix once ember-data has a way to rollback relationships
        user.favoriteDashboards[rollbackOperation](dashboard);
        this.naviNotifications.add({
          title: 'OOPS! An error occurred while updating favorite dashboards',
          style: 'danger',
          timeout: 'medium',
        });
      });
    }
  }
}

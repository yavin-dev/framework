/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { reject } from 'rsvp';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type { ModelFrom, Transition } from 'navi-core/utils/type-utils';
import type DashboardsDashboardRoute from 'navi-dashboards/routes/dashboards/dashboard';
import type LayoutFragment from 'navi-core/models/fragments/layout';
import type FragmentArrayBase from 'ember-data-model-fragments/FragmentArray';
import type NaviMetadataService from 'navi-data/services/navi-metadata';

export default class DashboardsDashboardWidgetsAddRoute extends Route {
  @service declare naviNotifications: NaviNotificationsService;

  @service declare naviMetadata: NaviMetadataService;

  /**
   * Saves new widget to dashboard
   * @override
   */
  async model(params: { unsavedWidgetId?: string }) {
    const { unsavedWidgetId: id } = params;
    const dashboard = this.modelFor('dashboards.dashboard') as ModelFrom<DashboardsDashboardRoute>;

    if (id) {
      const widget = this.store.peekAll('dashboard-widget').findBy('tempId', id);

      if (widget) {
        await widget.request?.loadMetadata();
        widget.set('dashboard', dashboard);
        await widget.save();
        const { layout } = dashboard.presentation;
        this._addToLayout(layout, Number(widget.id));
      } else {
        return reject('Unable to find unsaved widget');
      }
    }
    return undefined;
  }

  /**
   * Transitions to dashboard
   * @override
   */
  afterModel(): Transition {
    const dashboard = this.modelFor('dashboards.dashboard') as ModelFrom<DashboardsDashboardRoute>;
    return this.replaceWith('dashboards.dashboard', dashboard.id);
  }

  /**
   * Returns a shallow copy of the layout with the
   * new widget added
   *
   * @private
   * @param layout - dashboard layout array
   * @param widgetId - id of widget to add
   * @returns layout with new widget
   */
  _addToLayout(layout: FragmentArrayBase<LayoutFragment>, widgetId: number) {
    const row = this._findNextAvailableRow(layout);
    const nextItemLayout = this.store.createFragment('fragments/layout', {
      widgetId,
      width: 5,
      height: 4,
      column: 0,
      row,
    });
    layout.pushObject(nextItemLayout);
    return layout;
  }

  /**
   * Finds the next available row in a dashboard
   *
   * @private
   * @param layout - dashboard layout array
   * @returns next available row number
   */
  _findNextAvailableRow(layout: LayoutFragment[]): number {
    let nextRow = 0;
    layout.forEach((widget) => {
      let { row, height } = widget;
      if (row + height > nextRow) {
        nextRow = row + height;
      }
    });
    return nextRow;
  }

  /**
   * action to handle errors in route
   */
  @action
  error() {
    this.naviNotifications.add({
      title: 'An error occurred while creating a new widget',
      style: 'danger',
      timeout: 'medium',
    });
    this.replaceWith('dashboards');
  }
}

/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { computed } from '@ember/object';
import type DashboardModel from 'navi-core/models/dashboard';
import type { TaskInstance } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface Args {
  dashboard: DashboardModel;
  taskByWidget: Record<string, TaskInstance<unknown>>;
  addWidgetToDashboard(): void;
  onModelSaveOrRevert(): void;
  onAddFilter(dashboard: DashboardModel): void;
  onUpdateFilter(dashboard: DashboardModel): void;
  onRemoveFilter(dashboard: DashboardModel): void;
  saveAction(): void;
  deleteAction(): void;
}

export default class NaviDashboard extends Component<Args> {
  @tracked showHeaderShadow = false;

  /**
   * This property exists because ember-data-model-fragments
   * does not always propagate dirty state up to the parent
   * https://github.com/lytics/ember-data-model-fragments/issues/330#issuecomment-514325233
   *
   * @property {Boolean} dashboardIsDirty
   */
  @computed('args.dashboard.{hasDirtyAttributes,filters.hasDirtyAttributes,presentation.hasDirtyAttributes}')
  get dashboardIsDirty() {
    const dashboard = this.args.dashboard;

    return (
      dashboard.get('hasDirtyAttributes') ||
      dashboard.filters.get('hasDirtyAttributes') ||
      dashboard.presentation.get('hasDirtyAttributes')
    );
  }

  @action
  onScroll({ target: { scrollTop } }: { target: HTMLElement }) {
    this.showHeaderShadow = scrollTop > 0;
  }
}

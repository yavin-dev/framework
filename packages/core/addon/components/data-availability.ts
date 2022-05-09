/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later, cancel } from '@ember/runloop';
import { helper } from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import { Status } from 'navi-data/services/data-availability';
import { getDataSource } from 'navi-data/utils/adapter';
import type DataAvailabilityService from 'navi-data/services/data-availability';
import type { DataSourceAvailabilty, AvailabilityResult } from 'navi-data/services/data-availability';
import type { TaskGenerator, TaskInstance } from 'ember-concurrency';
import { sortBy } from 'lodash-es';

type Timer = ReturnType<typeof later>;
//@ts-ignore - TODO: cannot import Dropdown type
type Dropdown = any;

interface DataAvailabilityArgs {
  dataSources?: string[];
}

type DataSourceStatus = { dataSource: string; displayName: string; result: AvailabilityResult };
type AllAvailabilityStatus = { dataSources: DataSourceStatus[]; status: Status };

const REFRESH_POLL_MINUTES = 10;
const TABBED_OUT_POLL_MINUTES = 60;

export function overallAvailability(availabilities: DataSourceStatus[]) {
  const statuses = new Set(availabilities.map((v) => v.result.status));
  if (statuses.size === 0) {
    return Status.UNAVAILABLE;
  } else if (statuses.size === 1) {
    return statuses.keys().next().value;
  }
  return Status.DELAYED;
}

export default class DataAvailability extends Component<DataAvailabilityArgs> {
  @tracked declare availabilities: TaskInstance<AllAvailabilityStatus>;

  @service
  declare dataAvailability: DataAvailabilityService;

  isHidden = false;

  constructor(owner: unknown, args: DataAvailabilityArgs) {
    super(owner, args);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  willDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  statusClass = helper(([status]: [Status]) => {
    return {
      [Status.OK]: 'status-success',
      [Status.DELAYED]: 'status-warning',
      [Status.LATE]: 'status-danger',
      [Status.UNAVAILABLE]: 'grey-500',
    }[status];
  });

  closeTimer: Timer | null = null;

  @action
  onVisibilityChange() {
    this.isHidden = document.visibilityState === 'hidden';
    if (!this.isHidden) {
      this.availabilities = taskFor(this.updateAvailabilities).perform();
      taskFor(this.pollAvailabilities).perform();
    }
  }

  @action
  setupElement() {
    this.availabilities = taskFor(this.updateAvailabilities).perform();
    taskFor(this.pollAvailabilities).perform();
  }

  @action
  open(dropdown: Dropdown) {
    if (this.closeTimer) {
      cancel(this.closeTimer);
      this.closeTimer = null;
    } else {
      dropdown.actions.open();
    }
  }

  @action
  close(dropdown: Dropdown) {
    this.closeTimer = later(() => {
      this.closeTimer = null;
      dropdown.actions.close();
    }, 300);
  }

  @task({ restartable: true, maxConcurrency: 1 })
  *pollAvailabilities(): TaskGenerator<void> {
    if (Ember.testing) {
      return;
    }
    while (true) {
      const pollMinutes = this.isHidden ? TABBED_OUT_POLL_MINUTES : REFRESH_POLL_MINUTES;
      yield timeout(pollMinutes * 60 * 1000);
      this.availabilities = taskFor(this.updateAvailabilities).perform();
    }
  }

  @task
  *updateAvailabilities(): TaskGenerator<AllAvailabilityStatus> {
    const { dataSources } = this.args;
    const availabilities: DataSourceAvailabilty = yield taskFor(this.dataAvailability.fetchAll).perform(dataSources);

    const dataSourceStatuses = Object.entries(availabilities).map(([dataSource, result]) => {
      const dsConfig = getDataSource(dataSource);
      return { dataSource, displayName: dsConfig.displayName, result };
    });

    return {
      dataSources: sortBy(dataSourceStatuses, (dataSourceStatus) => dataSourceStatus.displayName),
      status: overallAvailability(dataSourceStatuses),
    };
  }
}

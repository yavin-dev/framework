/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { ItemActions } from 'navi-reports/services/item-action-dispatcher';
import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import type RouterService from '@ember/routing/router-service';
import type Model from '@ember-data/model';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';

export default class ItemConsumer extends ActionConsumer {
  @service
  declare naviNotifications: NaviNotificationsService;

  @service
  declare router: RouterService;

  actions = {
    async [ItemActions.DELETE_ITEM](this: ItemConsumer, item: Model) {
      //@ts-ignore
      const itemType = item.constructor.modelName?.replace(/-/g, ' ');

      try {
        item.deleteRecord();
        await item.save();
        item.unloadRecord(); // Locally clean record

        this.naviNotifications.add({
          title: capitalize(`${itemType} deleted`),
          timeout: 'short',
        });

        this.router.transitionTo('index');
      } catch (e) {
        // Restore record
        item.rollbackAttributes();

        this.naviNotifications.add({
          title: `An error occurred while deleting ${itemType}`,
          style: 'danger',
          timeout: 'medium',
        });
      }
    },
  };
}

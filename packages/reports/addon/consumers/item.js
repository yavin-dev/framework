/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { ItemActions } from 'navi-reports/services/item-action-dispatcher';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { featureFlag } from 'navi-core/helpers/feature-flag';

export default ActionConsumer.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * @property {Service} router
   */
  router: service(),

  actions: {
    /**
     * @action DELETE_ITEM
     * @param {DS.Model} item - report or dashboard that should be deleted
     */
    [ItemActions.DELETE_ITEM](item) {
      let itemName = get(item, 'title'),
        itemType = get(item, 'constructor.modelName'),
        transitionRoute = featureFlag('enableDirectory')
          ? 'directory.my-data'
          : itemType + 's';

      item.deleteRecord();

      return item
        .save()
        .then(() => {
          // Make sure record is cleaned up locally
          item.unloadRecord();

          get(this, 'naviNotifications').add({
            message: `Report "${itemName}" deleted successfully!`,
            type: 'success',
            timeout: 'short'
          });

          get(this, 'router').transitionTo(transitionRoute);
        })
        .catch(() => {
          // Rollback delete action
          item.rollbackAttributes();

          get(this, 'naviNotifications').add({
            message: `OOPS! An error occurred while deleting ${itemType} "${itemName}"`,
            type: 'danger',
            timeout: 'short'
          });
        });
    }
  }
});

/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { DeliveryRuleActions } from 'navi-reports/services/delivery-rule-action-dispatcher';
import { get } from '@ember/object';

export default ActionConsumer.extend({
  actions: {
    /**
     * @action DELETE_DELIVERY_RULE
     * @param {DS.Model} rule - delivery rule model
     * @param {Promise} promise - promise that indicates the result of the delete action
     */
    [DeliveryRuleActions.DELETE_DELIVERY_RULE](rule, promise) {
      rule.deleteRecord();

      return rule
        .save()
        .then(() => {
          // Make sure record is cleaned up locally
          rule.unloadRecord();

          promise.resolve();
        })
        .catch(({ errors }) => {
          //Rollback delete action
          rule.rollbackAttributes();

          promise.reject({ errors });
        });
    },

    /**
     * @action SAVE_DELIVERY_RULE
     * @param {DS.Model} rule - delivery rule model
     * @param {Promise} promise - promise that indicates the result of the save action
     */
    [DeliveryRuleActions.SAVE_DELIVERY_RULE](rule, promise) {
      return rule
        .save()
        .then(() => {
          promise.resolve();
        })
        .catch(error => {
          promise.reject(error);
        });
    },

    /**
     * @action REVERT_DELIVERY_RULE
     * @param {DS.Model} rule - delivery rule model
     */
    [DeliveryRuleActions.REVERT_DELIVERY_RULE](rule) {
      if (rule && !get(rule, 'isNew')) {
        rule.rollbackAttributes();
      }
    }
  }
});

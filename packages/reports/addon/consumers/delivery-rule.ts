/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { DeliveryRuleActions } from 'navi-reports/services/delivery-rule-action-dispatcher';
import type DeliveryRuleModel from 'navi-core/models/delivery-rule';

export type RSVPMethodsObj = {
  resolve: () => void;
  reject: (error?: unknown) => void;
};

export default class DeliveryRuleConsumer extends ActionConsumer {
  actions = {
    /**
     * @param rule - delivery rule model
     * @param promise - promise that indicates the result of the delete action
     */
    async [DeliveryRuleActions.DELETE_DELIVERY_RULE](
      this: DeliveryRuleConsumer,
      rule: DeliveryRuleModel,
      promise: RSVPMethodsObj
    ) {
      rule.deleteRecord();

      try {
        await rule.save();
        // Make sure record is cleaned up locally
        rule.unloadRecord();

        promise.resolve();
      } catch ({ errors }) {
        //Rollback delete action
        rule.rollbackAttributes();

        promise.reject({ errors });
      }
    },

    /**
     * @param rule - delivery rule model
     * @param promise - promise that indicates the result of the save action
     */
    async [DeliveryRuleActions.SAVE_DELIVERY_RULE](
      this: DeliveryRuleConsumer,
      rule: DeliveryRuleModel,
      promise: RSVPMethodsObj
    ) {
      try {
        await rule.save();
        promise.resolve();
      } catch (error) {
        promise.reject(error);
      }
    },

    /**
     * @param rule - delivery rule model
     */
    [DeliveryRuleActions.REVERT_DELIVERY_RULE](this: DeliveryRuleConsumer, rule: DeliveryRuleModel) {
      if (rule && !rule.isNew) {
        rule.rollbackAttributes();
      }
    },
  };
}

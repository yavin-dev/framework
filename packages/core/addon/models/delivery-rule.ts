/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import SchedulingRuleFragment from './fragments/scheduling-rules';
import UserModel from './user';
import DeliverableItemModel from './deliverable-item';
import { Moment } from 'moment';

const Validations = buildValidations({
  frequency: [
    validator('presence', {
      presence: true,
      message: 'Please select a delivery frequency'
    })
  ],
  format: [
    validator('presence', {
      presence: true,
      message: 'Please select a delivery format'
    })
  ],
  recipients: [
    validator('recipients', {
      noRecipientsMsg: 'There must be at least one recipient',
      invalidEmailMsg: 'Not all recipients are valid email addresses'
    })
  ]
});

export default class DeliveryRuleModel extends Model.extend(Validations) {
  /* == Attributes == */
  @attr('moment')
  createdOn!: Moment;

  @attr('moment')
  updatedOn!: Moment;

  @attr('string', { defaultValue: 'report' })
  deliveryType!: string;

  @attr('string', { defaultValue: 'week' })
  frequency!: string;

  @fragment('fragments/scheduling-rules', { defaultValue: () => ({ mustHaveData: false }) })
  schedulingRules!: SchedulingRuleFragment;

  @attr()
  format!: string;

  @attr({ defaultValue: () => [] })
  recipients!: string[];

  @attr('number', { defaultValue: 1 })
  version!: number;

  @belongsTo('deliverableItem', { async: true, inverse: 'deliveryRules', polymorphic: true })
  deliveredItem!: DS.PromiseObject<DeliverableItemModel>;

  @belongsTo('user', { async: true, inverse: 'deliveryRules' })
  owner!: DS.PromiseObject<UserModel>;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    deliveryRule: DeliveryRuleModel;
  }
}

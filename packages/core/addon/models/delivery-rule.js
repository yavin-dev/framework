/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { fragment } from 'ember-data-model-fragments/attributes';

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

export default DS.Model.extend(Validations, {
  /* == Attributes == */
  createdOn: DS.attr('moment'),
  updatedOn: DS.attr('moment'),
  deliveryType: DS.attr('string', { defaultValue: 'report' }),
  frequency: DS.attr('string', { defaultValue: 'week' }),
  schedulingRules: fragment('fragments/scheduling-rules', {
    defaultValue: () => {
      return { mustHaveData: false };
    }
  }),
  format: DS.attr({ defaultValue: () => {} }),
  recipients: DS.attr({ defaultValue: () => [] }),
  version: DS.attr('number', { defaultValue: '1' }),

  deliveredItem: DS.belongsTo('deliverableItem', {
    async: true,
    inverse: 'deliveryRules',
    polymorphic: true
  }),
  owner: DS.belongsTo('user', { async: true, inverse: 'deliveryRules' })
});

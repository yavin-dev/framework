/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{common-actions/schedule
 *    model=model
 *    onSave=(action 'onSave')
 *    onRevert=(action 'onRevert')
 *    onDelete=(action 'onDelete')
 * }}
 */

import Ember from 'ember';
import layout from '../../templates/components/common-actions/schedule';
import config from 'ember-get-config';
import { getApiErrMsg } from 'navi-core/utils/persistence-error';


const { A:arr, computed, get, set, setProperties } = Ember;
const defaultFrequencies = ['day', 'week', 'month', 'quarter', 'year'];

export default Ember.Component.extend({
  layout,

  /**
   * @property {Ember.Service} store
   */
  store: Ember.inject.service(),

  /**
   * @property {Ember.Service} user
   */
  user: Ember.inject.service(),

  /**
   * @property {DS.Model} deliveryRule - deliveryRule for the current user
   */
  deliveryRule: computed('model.deliveryRuleForUser.isFulfilled', function() {
    return get(this, 'model.deliveryRuleForUser');
  }),

  /**
   * @property {DS.Model} localDeliveryRule - Model that stores the values of the modal's fields
   */
  localDeliveryRule: computed('deliveryRule', function() {
    return get(this, 'deliveryRule.content') || this._createNewDeliveryRule();
  }),

  /**
   * @property {Array} frequencies
   */
  frequencies: computed(function() {
    return arr(get(config, 'navi.schedule.frequencies') || defaultFrequencies);
  }),

  /**
   * @property {Array} formats
   */
  formats: arr([ 'csv' ]),

  /**
   * @property {Boolean} isRuleValid
   */
  isRuleValid: computed.alias('localDeliveryRule.validations.isValid'),

  /**
   * @property {Boolean} attemptedSave
   */
  attemptedSave: false,

  /**
   * @method _createNewDeliveryRule
   * @private
   * @returns {DS.Model} - new delivery rule model
   */
  _createNewDeliveryRule() {
    return get(this, 'store').createRecord('delivery-rule', {
      deliveryType: 'report',
      format: { type: 'csv' },
    });
  },

  actions: {
    /**
     * @action onSave
     */
    onSave() {
      let deliveryRule = get(this, 'localDeliveryRule');

      if(get(this, 'isRuleValid')) {
        // Only add relationships to the new delivery rule if the fields are valid
        setProperties(deliveryRule, {
          deliveredItem: get(this, 'model'),
          owner: get(this, 'user').getUser()
        });

        set(this, 'attemptedSave', false);
        this.attrs.onSave(deliveryRule)
          .then(() => {
            set(this, 'notification', {
              text: 'Report delivery schedule successfully saved!',
              classNames: 'alert success'
            });
          })
          .catch(({errors}) => {
            set(this, 'notification', {
              text: getApiErrMsg(errors[0], 'Oops! There was an error updating your delivery settings'),
              classNames: 'alert failure'
            });
          })
          .finally(() => {
            set(this, 'isSaving', false);
            set(this, 'attemptedSave', true);
          });
      } else {
        set(this, 'isSaving', false);
        set(this, 'attemptedSave', true);
      }
    },

    /**
     * @action updateRecipients
     * @param {String} recipients - String of recipients from modal text area
     */
    updateRecipients(recipients) {
      let array = recipients.split(',').map(
        r => r.trim()
      );
      set(this, 'localDeliveryRule.recipients', array);
    },

    /**
     * @action closeModal
     */
    closeModal() {
      // Avoid `calling set on destroyed object` error
      if(!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
        set(this, 'isSaving', false);
        set(this, 'showModal', false);
        set(this, 'attemptedSave', false);
      }
    },

    /**
     * @action closeNotification
     */
    closeNotification() {
      set(this, 'notification', null);
    }
  }
});

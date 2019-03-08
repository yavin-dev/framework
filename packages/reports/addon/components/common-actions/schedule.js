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

import { alias } from '@ember/object/computed';

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../../templates/components/common-actions/schedule';
import config from 'ember-get-config';
import { getApiErrMsg } from 'navi-core/utils/persistence-error';
import { A as arr } from '@ember/array';
import { get, set, computed, setProperties } from '@ember/object';
import RSVP from 'rsvp';
import capitalize from 'lodash/capitalize';

const defaultFrequencies = ['day', 'week', 'month', 'quarter', 'year'];
const defaultFormats = ['csv'];

export default Component.extend({
  layout,

  /**
   * @property {Service} store
   */
  store: service(),

  /**
   * @property {Service} user
   */
  user: service(),

  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * @property {DS.Model} deliveryRule - deliveryRule for the current user
   */
  deliveryRule: computed('model.deliveryRuleForUser.isFulfilled', function() {
    return get(this, 'model.deliveryRuleForUser');
  }),

  /**
   * @property {DS.Model} localDeliveryRule - Model that stores the values of the modal's fields
   */
  localDeliveryRule: computed('deliveryRule.isFulfilled', function() {
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
  formats: computed(function() {
    let formats = get(config, 'navi.schedule.formats');

    if (!formats) {
      formats = defaultFormats.slice();
      if (get(config, 'navi.FEATURES.enableMultipleExport')) {
        formats.push('pdf');
      }
    }

    return arr(formats);
  }),

  /**
   * @property {Boolean} isRuleValid
   */
  isRuleValid: alias('localDeliveryRule.validations.isValid'),

  /**
   * @property {Boolean} disableSave
   */
  disableSave: computed('localDeliveryRule.hasDirtyAttributes', 'isRuleValid', 'isSaving', function() {
    if (get(this, 'isSaving')) {
      return true;
    }

    return !(get(this, 'localDeliveryRule.hasDirtyAttributes') && get(this, 'isRuleValid'));
  }),

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
      deliveryType: get(this, 'model.constructor.modelName'),
      format: { type: get(this, 'formats.firstObject') }
    });
  },

  actions: {
    /**
     * @action onSave
     */
    onSave() {
      let deliveryRule = get(this, 'localDeliveryRule');

      if (get(this, 'isRuleValid')) {
        // Only add relationships to the new delivery rule if the fields are valid
        setProperties(deliveryRule, {
          deliveredItem: get(this, 'model'),
          owner: get(this, 'user').getUser()
        });

        set(this, 'attemptedSave', false);
        let savePromise = new RSVP.Promise((resolve, reject) => {
          this.onSave(deliveryRule, { resolve, reject });
        });

        return savePromise
          .then(() => {
            set(this, 'notification', {
              text: `${capitalize(get(deliveryRule, 'deliveryType'))} delivery schedule successfully saved!`,
              classNames: 'alert success'
            });
          })
          .catch(({ errors }) => {
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
     * @action onDelete
     */
    onDelete() {
      let deliveryRule = get(this, 'localDeliveryRule'),
        deletePromise = new RSVP.Promise((resolve, reject) => {
          this.onDelete(deliveryRule, { resolve, reject });
        });

      return deletePromise
        .then(() => {
          //Add Page notification
          get(this, 'naviNotifications').add({
            message: `Delivery schedule successfully removed!`,
            type: 'success',
            timeout: 'short'
          });
        })
        .catch(() => {
          //Add Page notification
          get(this, 'naviNotifications').add({
            message: `OOPS! An error occurred while removing the delivery schedule.`,
            type: 'danger',
            timeout: 'short'
          });
        });
    },

    /**
     * @action updateRecipients
     * @param {Array} recipients - list of email strings
     */
    updateRecipients(recipients) {
      set(this, 'localDeliveryRule.recipients', recipients);
    },

    /**
     * @action updateFormat
     * @param {String} type - format type
     */
    updateFormat(type) {
      set(this, 'localDeliveryRule.format', { type });
    },

    /**
     * @action closeModal
     */
    closeModal() {
      // Avoid `calling set on destroyed object` error
      if (!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
        set(this, 'isSaving', false);
        set(this, 'showModal', false);
        set(this, 'attemptedSave', false);
        set(this, 'notification', null);
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

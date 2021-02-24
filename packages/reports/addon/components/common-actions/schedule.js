/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * <CommonActions::Schedule
 *    @model={{this.model}}
 *    @onSave={{this.onSave}}
 *    @onRevert={{this.onRevert}}
 *    @onDelete={{this.onDelete}}
 * />
 */

import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../../templates/components/common-actions/schedule';
import config from 'ember-get-config';
import { getApiErrMsg } from 'navi-core/utils/persistence-error';
import { A as arr } from '@ember/array';
import { get, set, computed, setProperties, action } from '@ember/object';
import RSVP from 'rsvp';
import { capitalize } from 'lodash-es';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { featureFlag } from 'navi-core/helpers/feature-flag';

const defaultFrequencies = ['day', 'week', 'month', 'quarter', 'year'];
const defaultFormats = ['csv'];

@templateLayout(layout)
@tagName('')
export default class ScheduleActionComponent extends Component {
  /**
   * @property {Service} store
   */
  @service store;

  /**
   * @property {Service} user
   */
  @service user;

  /**
   * @property {Service} naviNotifications
   */
  @service naviNotifications;

  /**
   * This property is set in the onOpen action to make sure
   * that we don't fetch any data until the modal is opened
   * @property {DS.Model} deliveryRule - deliveryRule for the current user
   */
  deliveryRule = undefined;

  /**
   * @property {DS.Model} localDeliveryRule - Model that stores the values of the modal's fields
   */
  localDeliveryRule = undefined;

  /**
   * @property {object} notification - Object that stores an in modal notification
   */
  notification = undefined;

  /**
   * @property {Array} frequencies
   */
  @computed
  get frequencies() {
    return arr(get(config, 'navi.schedule.frequencies') || defaultFrequencies);
  }

  /**
   * @property {Array} formats
   */
  @computed
  get formats() {
    let formats = get(config, 'navi.schedule.formats');

    if (!formats) {
      formats = defaultFormats.slice();
      const supportedFormats = featureFlag('exportFileTypes');
      if (Array.isArray(supportedFormats)) {
        formats = [...formats, ...supportedFormats];
      }
    }

    return arr(formats);
  }

  /**
   * @property {Boolean} isRuleValid
   */
  @reads('localDeliveryRule.validations.isValid') isRuleValid;

  /**
   * @property {Boolean} disableSave
   */
  @computed('localDeliveryRule.hasDirtyAttributes', 'isRuleValid', 'isSaving')
  get disableSave() {
    if (get(this, 'isSaving')) {
      return true;
    }

    return !(get(this, 'localDeliveryRule.hasDirtyAttributes') && get(this, 'isRuleValid'));
  }

  /**
   * @property {Boolean} attemptedSave
   */
  attemptedSave = false;

  /**
   * @method _createNewDeliveryRule
   * @private
   * @returns {DS.Model} - new delivery rule model
   */
  _createNewDeliveryRule() {
    return get(this, 'store').createRecord('delivery-rule', {
      deliveryType: get(this, 'model.constructor.modelName'),
      format: { type: get(this, 'formats.firstObject') },
    });
  }

  /**
   * @action doSave
   */
  @action
  doSave() {
    let deliveryRule = get(this, 'localDeliveryRule');

    if (get(this, 'isRuleValid')) {
      // Only add relationships to the new delivery rule if the fields are valid
      setProperties(deliveryRule, {
        deliveredItem: get(this, 'model'),
        owner: get(this, 'user').getUser(),
      });

      set(this, 'attemptedSave', false);
      let savePromise = new RSVP.Promise((resolve, reject) => {
        this.onSave(deliveryRule, { resolve, reject });
      });

      return savePromise
        .then(() => {
          this.naviNotifications.add({
            title: `${capitalize(get(deliveryRule, 'deliveryType'))} delivery schedule successfully saved!`,
            style: 'success',
            timeout: 'short',
          });
          this.closeModal();
        })
        .catch(({ errors }) => {
          set(this, 'notification', {
            text: getApiErrMsg(errors[0], 'There was an error updating your delivery settings'),
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
  }

  /**
   * @action doDelete
   */
  @action
  doDelete() {
    let deliveryRule = get(this, 'localDeliveryRule'),
      deletePromise = new RSVP.Promise((resolve, reject) => {
        this.onDelete(deliveryRule, { resolve, reject });
      });

    return deletePromise
      .then(() => {
        //Make sure there is no more local rule after deletion
        set(this, 'localDeliveryRule', undefined);

        //Add Page notification
        this.naviNotifications.add({
          title: `Delivery schedule removed`,
          style: 'success',
          timeout: 'short',
        });
      })
      .catch(() => {
        set(this, 'notification', {
          text: `An error occurred while removing the delivery schedule`,
        });
      });
  }

  /**
   * @action onOpen
   */
  @action
  onOpen() {
    //Kick off a fetch for existing delivery rules
    set(this, 'deliveryRule', get(this, 'model.deliveryRuleForUser'));

    get(this, 'deliveryRule')
      .then((rule) => {
        set(this, 'localDeliveryRule', rule ? rule : get(this, 'localDeliveryRule') || this._createNewDeliveryRule());
      })
      .catch(() => {
        set(this, 'localDeliveryRule', this._createNewDeliveryRule());
      });
  }

  /**
   * @action updateRecipients
   * @param {Array} recipients - list of email strings
   */
  @action
  updateRecipients(recipients) {
    set(this, 'localDeliveryRule.recipients', recipients);
  }

  /**
   * @action updateFormat
   * @param {String} type - format type
   */
  @action
  updateFormat(type) {
    set(this, 'localDeliveryRule.format', { type });
  }

  /**
   * @action closeModal
   */
  @action
  closeModal() {
    // Avoid `calling set on destroyed object` error
    if (!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
      set(this, 'isSaving', false);
      set(this, 'showModal', false);
      set(this, 'attemptedSave', false);
      set(this, 'notification', null);
    }
  }

  /**
   * @action closeNotification
   */
  @action
  closeNotification() {
    set(this, 'notification', null);
  }
}

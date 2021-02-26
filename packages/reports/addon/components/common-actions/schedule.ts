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
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import config from 'ember-get-config';
// @ts-ignore
import { getApiErrMsg } from 'navi-core/utils/persistence-error';
import { A as arr } from '@ember/array';
import { get, set, computed, setProperties, action } from '@ember/object';
import RSVP from 'rsvp';
import { capitalize } from 'lodash-es';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { tracked } from '@glimmer/tracking';
import StoreService from '@ember-data/store';
// @ts-ignore
import DeliveryRuleModel from './delivery-rule';
import type NaviNotificationService from 'navi-core/services/interfaces/navi-notifications';
import UserService from 'navi-core/services/user';

const defaultFrequencies = ['day', 'week', 'month', 'quarter', 'year'];
const defaultFormats = ['csv'];

interface Args {
  model: DeliveryRuleModel;
  onDelete: (arg0: any, arg1: any) => void;
  onSave: (arg0: any, arg1: any) => void;
  onRevert: (arg0: any, arg1: any) => void;
}

export default class ScheduleActionComponent extends Component<Args> {
  /**
   * @property {Service} store
   */
  @service store!: StoreService;

  /**
   * @property {Service} user
   */
  @service user!: UserService;

  /**
   * @property {Service} naviNotifications
   */
  @service naviNotifications!: NaviNotificationService;

  /**
   * This property is set in the onOpen action to make sure
   * that we don't fetch any data until the modal is opened
   * @property {DS.Model} deliveryRule - deliveryRule for the current user
   */
  deliveryRule: DeliveryRuleModel;

  /**
   * @property {DS.Model} localDeliveryRule - Model that stores the values of the modal's fields
   */
  localDeliveryRule: DeliveryRuleModel;

  /**
   * @property {object} notification - Object that stores an in modal notification
   */
  @tracked notification: { text: string } | undefined;

  @tracked isSaving = false;

  @tracked showModal = false;

  /**
   * @property {Array} frequencies
   */
  @computed('config.navi.schedule.frequencies')
  get frequencies() {
    return arr(config.navi.schedule?.frequencies || defaultFrequencies);
  }

  /**
   * @property {Array} formats
   */
  @computed('config.navi.schedule.formats')
  get formats() {
    let formats = config.navi.schedule.frequencies;

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
  @reads('localDeliveryRule.validations.isValid') isRuleValid = false;

  /**
   * @property {Boolean} disableSave
   */
  @computed('localDeliveryRule.hasDirtyAttributes', 'isRuleValid', 'isSaving')
  get disableSave() {
    if (this.isSaving) {
      return true;
    }

    return !(this.localDeliveryRule.hasDirtyAttributes && get(this, 'isRuleValid'));
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
    return this.store.createRecord('delivery-rule', {
      deliveryType: this.args.model.constructor.modelName,
      format: { type: this.formats.firstObject },
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
        deliveredItem: this.args.model,
        owner: this.user.getUser(),
      });

      set(this, 'attemptedSave', false);
      let savePromise = new RSVP.Promise((resolve, reject) => {
        this.args.onSave(deliveryRule, { resolve, reject });
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
        this.args.onDelete(deliveryRule, { resolve, reject });
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
    set(this, 'deliveryRule', this.args.model.deliveryRuleForUser);

    get(this, 'deliveryRule')
      .then((rule: DeliveryRuleModel) => {
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
  updateRecipients(recipients: string[]) {
    set(this.localDeliveryRule, 'recipients', recipients);
  }

  /**
   * @action updateFormat
   * @param {String} type - format type
   */
  @action
  updateFormat(type: string) {
    set(this.localDeliveryRule, 'format', { type });
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
      set(this, 'notification', undefined);
    }
  }

  /**
   * @action closeNotification
   */
  @action
  closeNotification() {
    set(this, 'notification', undefined);
  }
}

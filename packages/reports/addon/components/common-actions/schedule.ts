/**
 * Copyright 2021, Yahoo Holdings Inc.
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
import { computed, setProperties, action } from '@ember/object';
import RSVP from 'rsvp';
import { capitalize } from 'lodash-es';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { tracked } from '@glimmer/tracking';
import StoreService from '@ember-data/store';
// @ts-ignore
import DeliveryRuleModel from './delivery-rule';
import type NaviNotificationService from 'navi-core/services/interfaces/navi-notifications';
import UserService from 'navi-core/services/user';
import DeliverableItemModel from 'navi-core/addon/models/deliverable-item';

const defaultFrequencies = ['day', 'week', 'month', 'quarter', 'year'];
const defaultFormats = ['csv'];

type RSVPMethodsObj = {
  resolve: () => void;
  reject: () => void;
};

interface Args {
  model: DeliverableItemModel;
  onDelete: (DeliveryRule: DeliveryRuleModel, promise: RSVPMethodsObj) => void;
  onSave: (DeliveryRule: DeliveryRuleModel, promise: RSVPMethodsObj) => void;
  onRevert: (DeliveryRule: DeliveryRuleModel, promise: RSVPMethodsObj) => void;
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
  @tracked deliveryRule: DeliveryRuleModel;

  /**
   * @property {DS.Model} localDeliveryRule - Model that stores the values of the modal's fields
   */
  @tracked localDeliveryRule?: DeliveryRuleModel;

  /**
   * @property {object} notification - Object that stores an in modal notification
   */
  @tracked notification?: string;

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
  get formats() {
    let formats = config.navi.schedule.formats;

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
  @reads('localDeliveryRule.validations.isValid') isRuleValid!: boolean;

  /**
   * @property {Boolean} disableSave
   */
  get disableSave() {
    if (this.isSaving) {
      return true;
    }

    return !(this.localDeliveryRule.hasDirtyAttributes && this.isRuleValid);
  }

  /**
   * @property {Boolean} attemptedSave
   */
  @tracked attemptedSave = false;

  /**
   * @method _createNewDeliveryRule
   * @private
   * @returns {DS.Model} - new delivery rule model
   */
  _createNewDeliveryRule() {
    return this.store.createRecord('delivery-rule', {
      // @ts-ignore
      deliveryType: this.args.model.constructor.modelName,
      format: { type: this.formats.firstObject },
    });
  }

  /**
   * @action doSave
   */
  @action
  async doSave() {
    if (this.isRuleValid) {
      // Only add relationships to the new delivery rule if the fields are valid
      setProperties(this.localDeliveryRule, {
        deliveredItem: this.args.model,
        owner: this.user.getUser(),
      });

      this.attemptedSave = false;
      let savePromise = new RSVP.Promise((resolve, reject) => {
        this.args.onSave(this.localDeliveryRule, { resolve, reject });
      });

      try {
        await savePromise;

        this.naviNotifications.add({
          title: `${capitalize(this.localDeliveryRule.deliveryType)} delivery schedule successfully saved!`,
          style: 'success',
          timeout: 'short',
        });
        this.closeModal();
      } catch (errors) {
        this.notification = getApiErrMsg(errors.errors[0], 'There was an error updating your delivery settings');
      } finally {
        this.isSaving = false;
        this.attemptedSave = true;
      }
    } else {
      this.isSaving = false;
      this.attemptedSave = true;
    }
  }

  /**
   * @action doDelete
   */
  @action
  async doDelete() {
    let deliveryRule = this.localDeliveryRule,
      deletePromise = new RSVP.Promise((resolve, reject) => {
        this.args.onDelete(deliveryRule, { resolve, reject });
      });

    try {
      await deletePromise;
      //Make sure there is no more local rule after deletion
      this.localDeliveryRule = undefined;

      //Add Page notification
      this.naviNotifications.add({
        title: `Delivery schedule removed`,
        style: 'success',
        timeout: 'short',
      });
    } catch (e) {
      this.notification = `An error occurred while removing the delivery schedule`;
    }
  }

  /**
   * @action onOpen
   */
  @action
  onOpen() {
    //Kick off a fetch for existing delivery rules
    this.deliveryRule = this.args.model.deliveryRuleForUser;

    this.deliveryRule
      .then((rule: DeliveryRuleModel) => {
        this.localDeliveryRule = rule ? rule : this.localDeliveryRule || this._createNewDeliveryRule();
      })
      .catch(() => {
        this.localDeliveryRule = this._createNewDeliveryRule();
      });
  }

  /**
   * @action updateRecipients
   * @param {Array} recipients - list of email strings
   */
  @action
  updateRecipients(recipients: string[]) {
    this.localDeliveryRule.recipients = recipients;
  }

  /**
   * @action updateFormat
   * @param {String} type - format type
   */
  @action
  updateFormat(type: string) {
    this.localDeliveryRule.format = { type };
  }

  /**
   * @action closeModal
   */
  @action
  closeModal() {
    // Avoid `calling set on destroyed object` error
    if (!this.isDestroyed && !this.isDestroying) {
      this.isSaving = false;
      this.showModal = false;
      this.attemptedSave = false;
      this.notification = undefined;
    }
  }

  /**
   * @action closeNotification
   */
  @action
  closeNotification() {
    this.notification = undefined;
  }
}

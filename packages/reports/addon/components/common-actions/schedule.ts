/* eslint-disable ember/no-assignment-of-untracked-properties-used-in-tracking-contexts */
/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { reads } from '@ember/object/computed';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import config from 'ember-get-config';
// @ts-ignore
import { getAllApiErrMsg } from 'navi-core/utils/persistence-error';
import { A as arr } from '@ember/array';
import { computed, setProperties, action } from '@ember/object';
import RSVP from 'rsvp';
import { capitalize } from 'lodash-es';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import type StoreService from '@ember-data/store';
import type DeliveryRuleModel from 'navi-core/models/delivery-rule';
import type NaviNotificationService from 'navi-core/services/interfaces/navi-notifications';
import type UserService from 'navi-core/services/user';
import type DeliverableItemModel from 'navi-core/models/deliverable-item';
import type { RSVPMethodsObj } from 'navi-reports/consumers/delivery-rule';
import GsheetFormat from 'navi-core/models/gsheet';

const defaultFrequencies = ['day', 'week', 'month', 'quarter', 'year'];
const defaultFormats = ['csv'];

interface Args {
  model: DeliverableItemModel;
  isValidForSchedule?(): Promise<boolean>;
  onDelete(DeliveryRule: DeliveryRuleModel, promise: RSVPMethodsObj): void;
  onSave(DeliveryRule: DeliveryRuleModel, promise: RSVPMethodsObj): void;
  onRevert(DeliveryRule: DeliveryRuleModel, promise: RSVPMethodsObj): void;
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
  @tracked deliveryRule!: Promise<DeliveryRuleModel | undefined>;

  /**
   * @property {DS.Model} localDeliveryRule - Model that stores the values of the modal's fields
   */
  @tracked localDeliveryRule?: DeliveryRuleModel;

  /**
   * @property {string} notification - In modal notification text
   */
  @tracked notification?: string[];

  @tracked isSaving = false;

  @tracked showModal = false;

  deliveryOptions = ['email', 'none'];
  /**
   * List of formats it makes sense to show 'overwrite file' toggle
   * Good for cloud based formats
   */
  overwriteableFormats = ['gsheet'];

  /**
   * Promise resolving to whether item is valid to be scheduled
   */
  get isValidForSchedule(): Promise<boolean> {
    return this.args.isValidForSchedule?.() ?? Promise.resolve(true);
  }

  /**
   * @property {Array} frequencies
   */
  @computed('config.navi.schedule.frequencies')
  get frequencies() {
    return arr(config.navi.schedule?.frequencies || defaultFrequencies);
  }

  get modelType() {
    //@ts-ignore
    return this.args.model.constructor.modelName;
  }

  /**
   * @property {Array} formats
   */
  get formats() {
    let formats = config.navi.schedule?.formats;

    if (!formats) {
      formats = defaultFormats.slice();
      const supportedFormats = featureFlag('exportFileTypes');
      if (Array.isArray(supportedFormats) && supportedFormats.length > 0) {
        formats = [...formats, ...supportedFormats];
        const uniqFormats = [...new Set(formats)];
        formats = uniqFormats.sort(function (a, b) {
          //Sort the index based on defaultFormat inputs
          return defaultFormats.indexOf(b) - defaultFormats.indexOf(a);
        });
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

    return !(this.localDeliveryRule?.hasDirtyAttributes && this.isRuleValid);
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
        assert('The localDeliveryRule is defined', this.localDeliveryRule);
        this.args.onSave(this.localDeliveryRule, { resolve, reject });
      });

      try {
        await savePromise;
        assert('The localDeliveryRule is defined', this.localDeliveryRule);
        this.naviNotifications.add({
          title: `${capitalize(this.localDeliveryRule.deliveryType)} delivery schedule successfully saved!`,
          style: 'success',
          timeout: 'short',
        });
        this.closeModal();
      } catch (errors) {
        this.notification = getAllApiErrMsg(errors.errors[0], 'There was an error updating your delivery settings');
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
    const deliveryRule = this.localDeliveryRule;
    assert('The localDeliveryRule is defined', deliveryRule);
    const deletePromise = new RSVP.Promise((resolve, reject) => {
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
      this.notification = [`An error occurred while removing the delivery schedule`];
    }
  }

  /**
   * @action onOpen
   */
  @action
  async onOpen() {
    //Kick off a fetch for existing delivery rules
    this.deliveryRule = this.args.model.deliveryRuleForUser;

    try {
      const rule = await this.deliveryRule;
      this.localDeliveryRule = rule ? rule : this.localDeliveryRule || this._createNewDeliveryRule();
    } catch (e) {
      this.localDeliveryRule = this._createNewDeliveryRule();
    }
  }

  /**
   * @action updateRecipients
   * @param {Array} recipients - list of email strings
   */
  @action
  updateRecipients(recipients: string[]) {
    assert('The localDeliveryRule is defined', this.localDeliveryRule);
    this.localDeliveryRule.recipients = recipients;
  }

  /**
   * @action updateFormat
   * @param {String} type - format type
   */
  @action
  updateFormat(type: string) {
    assert('The localDeliveryRule is defined', this.localDeliveryRule);
    assert('The format is defined', this.localDeliveryRule.format);
    this.localDeliveryRule.format.type = type;
  }

  @action
  toggleOverwriteFile() {
    assert('The localDeliveryRule is defined', this.localDeliveryRule);
    assert(
      'Must be a type that supports overwriteFile in order to toggle',
      this.overwriteableFormats.includes(this.localDeliveryRule.format.type)
    );
    const format = this.localDeliveryRule.format as GsheetFormat; //currently only type that supports this, make more dynamic with new types
    if (!format.options) {
      format.options = { overwriteFile: false };
    }
    const newOverwrite = !format.options?.overwriteFile;
    format.options.overwriteFile = newOverwrite;
    this.localDeliveryRule.format = format;
    // eslint-disable-next-line no-self-assign
    this.localDeliveryRule = this.localDeliveryRule;
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

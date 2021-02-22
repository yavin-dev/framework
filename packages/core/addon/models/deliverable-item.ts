/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import Model, { hasMany } from '@ember-data/model';
import { A as arr } from '@ember/array';
import { computed } from '@ember/object';
import UserService from 'navi-core/services/user';
import { inject as service } from '@ember/service';
//@ts-ignore
import { v1 } from 'ember-uuid';
import DeliveryRuleModel from './delivery-rule';
import Store from '@ember-data/store';

export default class DeliverableItemModel extends Model {
  @hasMany('delivery-rule', { async: true, inverse: 'deliveredItem' })
  deliveryRules!: DS.PromiseManyArray<DeliveryRuleModel>;

  @service
  protected user!: UserService;

  /**
   * @property {String} modelId - id or tempId of model
   */
  get modelId(): string {
    return this.get('id') || this.get('tempId');
  }

  /**
   * @property {String} tempId - uuid for unsaved records
   */
  @computed('id')
  get tempId() {
    return this.get('id') ? null : v1();
  }

  /**
   * @property store - Store service with fragments
   */
  store!: Store;

  /**
   * @property {DS.Model} deliveryRuleForUser - delivery rule model
   */
  @computed('user', 'deliveryRules.[]')
  get deliveryRuleForUser() {
    const userId = this.user.getUser().id;

    return this.get('deliveryRules').then((rules) =>
      arr(rules.filter((rule) => rule.get('owner').get('id') === userId)).get('firstObject')
    );
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'deliverable-item': DeliverableItemModel;
  }
}

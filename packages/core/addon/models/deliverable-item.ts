import Model, { hasMany } from '@ember-data/model';
import { computed } from '@ember/object';
import UserService from 'navi-core/services/user';
import { inject as service } from '@ember/service';
//@ts-ignore
import { v1 } from 'ember-uuid';
import DeliveryRuleModel from './delivery-rule';
import Store from '@ember-data/store';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

export default class DeliverableItemModel extends Model {
  @hasMany('delivery-rule', { async: true, inverse: 'deliveredItem' })
  deliveryRules!: DS.PromiseManyArray<DeliveryRuleModel>;

  @service
  protected user!: UserService;

  /**
   * @property {String} modelId - id or tempId of model
   */
  get modelId(): string {
    return this.id || this.tempId;
  }

  /**
   * @property {String} tempId - uuid for unsaved records
   */
  @computed('id')
  get tempId() {
    return this.id ? null : v1();
  }

  /**
   * @property store - Store service with fragments
   */
  store!: Store;

  /**
   * @property {DS.Model} deliveryRulesForUser - delivery rule model
   */
  @computed('user', 'deliveryRules.[]')
  get deliveryRulesForUser() {
    const userId = this.user.getUser()?.id;

    return this.deliveryRules.then((rules) => rules.filter((rule) => rule.get('owner').get('id') === userId));
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'deliverable-item': DeliverableItemModel;
  }
}

import { attr, belongsTo } from '@ember-data/model';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import DeliverableItem from './deliverable-item';
import hasVisualization from 'navi-core/mixins/models/has-visualization';
import { validator, buildValidations } from 'ember-cp-validations';
import RequestFragment from './request';
import UserModel from './user';
import { Moment } from 'moment';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import type { VisualizationType } from 'navi-core/models/registry';

const Validations = buildValidations({
  visualization: [validator('belongs-to')],
  request: [validator('belongs-to')],
  title: [
    validator('presence', {
      presence: true,
      ignoreBlank: true,
      message: 'The report must have a title',
    }),
  ],
});

export default class ReportModel extends DeliverableItem.extend(hasVisualization, Validations) {
  @attr('string', { defaultValue: 'Untitled Report' })
  title!: string;

  @attr('moment')
  createdOn!: Moment;

  @attr('moment')
  updatedOn!: Moment;

  @belongsTo('user', { async: true })
  owner!: DS.PromiseObject<UserModel>;

  @fragment('request', { defaultValue: () => ({}) })
  request!: RequestFragment;

  /**
   * @property {Boolean} isOwner - is owner of report
   */
  get isOwner() {
    const userId = this.user.getUser()?.id;
    return this.owner.get('id') === userId;
  }

  /**
   * @property {Boolean} isFavorite - is favorite of owner
   */
  get isFavorite() {
    const user = this.user.getUser();
    // referenced this way so that changes are picked up by ember auto-tracking
    return user?.favoriteReports.toArray().some((r) => r.id === this.id);
  }

  /**
   * Clones the model
   *
   * @method clone
   * @returns Object - cloned Report model
   */
  clone() {
    const clonedReport = this.toJSON() as this; //TODO not totally right

    const type = clonedReport.visualization.type as VisualizationType;

    return this.store.createRecord('report', {
      title: clonedReport.title,
      visualization: this.store.createFragment(type, clonedReport.visualization).serialize(),
      request: this.request.clone(),
    });
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    report: ReportModel;
  }
}

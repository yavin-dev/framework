/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr, belongsTo, hasMany, AsyncBelongsTo, AsyncHasMany } from '@ember-data/model';
//@ts-ignore
import { fragment, fragmentArray } from 'ember-data-model-fragments/attributes';
import DeliverableItem from 'navi-core/models/deliverable-item';
import config from 'ember-get-config';
//@ts-ignore
import { copy } from 'ember-copy';
import { validator, buildValidations } from 'ember-cp-validations';
import UserModel from './user';
import FragmentArray from 'ember-data-model-fragments/FragmentArray';
import { Moment } from 'moment';
import FilterFragment from './request/filter';
import DashboardWidget from './dashboard-widget';
import PresentationFragment from './fragments/presentation';

const Validations = buildValidations({
  title: [
    validator('presence', {
      presence: true,
      ignoreBlank: true,
      message: 'The dashboard must have a title',
    }),
  ],
});

export default class DashboardModel extends DeliverableItem.extend(Validations) {
  @belongsTo('user', { async: true })
  declare owner: AsyncBelongsTo<UserModel>;

  @hasMany('user', { async: true, inverse: 'editingDashboards' })
  declare editors: AsyncHasMany<UserModel>;

  @attr('string')
  declare title: string;

  @attr('moment')
  declare createdOn: Moment;

  @attr('moment')
  declare updatedOn: Moment;

  @hasMany('dashboard-widget', { async: true })
  declare widgets: AsyncHasMany<DashboardWidget>;

  @fragmentArray('request/filter', { defaultValue: [] })
  declare filters: FragmentArray<FilterFragment>;

  @fragment('fragments/presentation', { defaultValue: () => ({}) })
  declare presentation: PresentationFragment;

  get isUserOwner() {
    return this.owner.get('id') === config.navi.user;
  }

  get isUserEditor() {
    return this.editors.map((e) => e.id).includes(config.navi.user);
  }

  get canUserEdit(): boolean {
    return this.isUserOwner || this.isUserEditor;
  }

  get isFavorite() {
    const user = this.user.getUser();
    // referenced this way so that changes are picked up by ember auto-tracking
    return user?.favoriteDashboards.toArray().some((r) => r.id === this.id);
  }

  clone() {
    const user = this.user.getUser();
    const clonedDashboard = Object.assign(this.toJSON(), {
      owner: user,
      editors: [],
      widgets: [],
      filters: this.filters.map((filter) => {
        return this.store.createFragment('request/filter', {
          field: filter.field,
          parameters: filter.parameters,
          type: filter.type,
          operator: filter.operator,
          values: filter.values,
          source: filter.source,
        });
      }),
      presentation: copy(this.presentation),
      createdOn: null,
      updatedOn: null,
    });

    return this.store.createRecord('dashboard', clonedDashboard);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    dashboard: DashboardModel;
  }
}

/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import { attr, belongsTo, hasMany } from '@ember-data/model';
import { or } from '@ember/object/computed';
import { A } from '@ember/array';
import { computed } from '@ember/object';
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
import FilterFragment from './bard-request-v2/fragments/filter';

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
  author!: DS.PromiseObject<UserModel>;

  @attr('string')
  title!: string;

  @attr('moment')
  createdOn!: Moment;

  @attr('moment')
  updatedOn!: Moment;

  @hasMany('dashboard-widget', { async: true })
  widgets!: DS.PromiseManyArray<TODO>;

  @fragmentArray('bard-request-v2/fragments/filter', { defaultValue: [] })
  filters!: FragmentArray<FilterFragment>;

  @fragment('fragments/presentation', { defaultValue: () => ({}) })
  presentation!: TODO;

  /**
   * @property {Boolean} isUserOwner - user is the dashboard owner
   */
  @computed('author')
  get isUserOwner() {
    return this.get('author').get('id') === config.navi.user;
  }

  /**
   * @property {Boolean} isUserEditor - user is in the dashboard editor list
   */
  isUserEditor = false;

  /**
   * @property {Boolean} canUserEdit - user has edit permissions for dashboard
   */
  @or('isUserOwner', 'isUserEditor')
  canUserEdit!: boolean;

  /**
   * @property {Boolean} isFavorite - is favorite of author
   */
  get isFavorite() {
    const user = this.user.getUser();
    const favoriteDashboards = user.hasMany('favoriteDashboards').ids();
    return A(favoriteDashboards).includes(this.get('id'));
  }

  /**
   * Clones the model
   *
   * @method clone
   * @returns Object - cloned Dashboard model
   */
  clone() {
    const user = this.user.getUser();
    const clonedDashboard = Object.assign(this.toJSON(), {
      author: user,
      widgets: [],
      filters: this.filters.map((filter) => {
        return this.store.createFragment('bard-request-v2/fragments/filter', {
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

/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';
import FragmentArray from 'ember-data-model-fragments/FragmentArray';
//@ts-ignore
import { fragmentArray } from 'ember-data-model-fragments/attributes';
//@ts-ignore
import { v1 } from 'ember-uuid';
import hasVisualization from 'navi-core/mixins/models/has-visualization';
import { validator, buildValidations } from 'ember-cp-validations';
import DashboardModel from './dashboard';
import type { Moment } from 'moment';
import type RequestFragment from './request';

const Validations = buildValidations({
  visualization: [validator('belongs-to')],
  request: [validator('belongs-to')],
  title: [
    validator('presence', {
      presence: true,
      ignoreBlank: true,
      message: 'The widget must have a title',
    }),
  ],
});

export default class DashboardWidget extends Model.extend(hasVisualization, Validations) {
  @belongsTo('dashboard') dashboard!: AsyncBelongsTo<DashboardModel>;
  @attr('string', { defaultValue: 'Untitled Widget' }) title!: string;
  @attr('moment') createdOn!: Moment;
  @attr('moment') updatedOn!: Moment;
  @fragmentArray('request', { defaultValue: () => [] })
  requests!: FragmentArray<RequestFragment>;

  /**
   * Owner retrived from dashboard
   */
  @computed('dashboard.owner')
  get owner() {
    return this.dashboard.get('owner');
  }

  /**
   * first request object
   */
  @computed('requests.firstObject')
  get request(): RequestFragment {
    const request = this.requests.firstObject;
    assert('A request is defined for the widget', request);
    return request;
  }

  /**
   * uuid for unsaved records
   */
  @computed('id')
  get tempId() {
    if (this.id) {
      return null;
    } else {
      return v1();
    }
  }

  /**
   * Clones the model
   *
   * @returns cloned Dashboard-Widget model
   */
  clone() {
    let clonedWidget = this.toJSON() as DashboardWidget;

    const widget = this.store.createRecord('dashboard-widget', {
      title: clonedWidget.title,
      requests: this.requests.map((request) => request.clone()),
    });
    widget.updateVisualization(this.visualization.clone());
    return widget;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'dashboard-widget': DashboardWidget;
  }
}

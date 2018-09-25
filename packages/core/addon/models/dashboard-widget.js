/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import DS from 'ember-data';
import MF from 'model-fragments';
import { v1 } from 'ember-uuid';
import hasVisualization from 'navi-core/mixins/models/has-visualization';
import { validator, buildValidations } from 'ember-cp-validations';

const { computed, get } = Ember;
const Validations = buildValidations({
  visualization: [validator('belongs-to')],
  request: [validator('belongs-to')],
  title: [
    validator('presence', {
      presence: true,
      ignoreBlank: true,
      message: 'The widget must have a title'
    })
  ]
});

export default DS.Model.extend(hasVisualization, Validations, {
  dashboard: DS.belongsTo('dashboard'),
  title: DS.attr('string', { defaultValue: 'Untitled Widget' }),
  createdOn: DS.attr('moment'),
  updatedOn: DS.attr('moment'),
  requests: MF.fragmentArray('bard-request/request', {
    defaultValue: () => []
  }),

  /**
   * Author retrived from dashboard
   * @property author
   */
  author: computed('dashboard', function() {
    return get(this, 'dashboard.author');
  }),

  /**
   * @property {MF.Fragment} request - first request object
   */
  request: computed('requests', function() {
    return get(this, 'requests.firstObject');
  }),

  /**
   * @property {String} tempId - uuid for unsaved records
   */
  tempId: computed('id', function() {
    if (get(this, 'id')) {
      return null;
    } else {
      return v1();
    }
  }),

  /**
   * Clones the model
   *
   * @method clone
   * @returns Object - cloned Dashboard-Widget model
   */
  clone() {
    let clonedWidget = this.toJSON();

    return this.store.createRecord('dashboard-widget', {
      title: clonedWidget.title,
      visualization: this.store.createFragment(clonedWidget.visualization.type, clonedWidget.visualization),
      requests: get(this, 'requests').map(request => request.clone())
    });
  }
});

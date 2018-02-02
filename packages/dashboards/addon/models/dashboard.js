/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import DS from 'ember-data';
import MF from 'model-fragments';
import config from 'ember-get-config';
import { validator, buildValidations } from 'ember-cp-validations';

const { get, computed } = Ember;

const Validations = buildValidations({
  title: [
    validator('presence', {
      presence: true,
      ignoreBlank: true,
      message: 'The dashboard must have a title'
    })
  ]
});

export default DS.Model.extend(Validations, {
  author:       DS.belongsTo('user', {async: true}),
  title:        DS.attr('string'),
  createdOn:    DS.attr('moment'),
  updatedOn:    DS.attr('moment'),
  widgets:      DS.hasMany('dashboard-widget', { async: true }),
  presentation: MF.fragment('fragments/presentation', { defaultValue: () => { return {}; } }),

  /**
   * @property {Service} user
   */
  user: Ember.inject.service(),

  /**
   * @property {Boolean} isUserOwner - user is the dashboard owner
   */
  isUserOwner: computed('author', function() {
    return get(this, 'author.id') === config.navi.user;
  }),

  /**
   * @property {Boolean} isUserEditor - user is in the dashboard editor list
   */
  isUserEditor: false,

  /**
   * @property {Boolean} canUserEdit - user has edit permissions for dashboard
   */
  canUserEdit: computed.or('isUserOwner', 'isUserEditor'),

  /**
   * @property {Boolean} isFavorite - is favorite of author
   */
  isFavorite: computed(function() {
    let user = get(this, 'user').getUser(),
        favoriteDashboards = user.hasMany('favoriteDashboards').ids();

    return Ember.A(favoriteDashboards).includes(get(this, 'id'));
  }).volatile(),

  /**
   * Clones the model
   *
   * @method clone
   * @returns Object - cloned Dashboard model
   */
  clone() {
    let user = get(this, 'user').getUser(),
        clonedDashboard = Object.assign(this.toJSON(), {
          author: user,
          widgets: [],
          createdOn: null,
          updatedOn: null
        });

    return this.store.createRecord('dashboard', clonedDashboard);
  }
});

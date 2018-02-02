/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import DS from 'ember-data';
import MF from 'model-fragments';
import { v1 } from 'ember-uuid';
import hasVisualization from 'navi-reports/mixins/models/has-visualization';
import { validator, buildValidations } from 'ember-cp-validations';

const { A:arr, get, computed } = Ember;
const Validations = buildValidations({
  visualization: [
    validator('belongs-to')
  ],
  request: [
    validator('belongs-to')
  ],
  title: [
    validator('presence', {
      presence: true,
      ignoreBlank: true,
      message: 'The report must have a title'
    })
  ]
});

export default DS.Model.extend(hasVisualization, Validations, {

  /* == Attributes == */
  title:          DS.attr('string', { defaultValue: 'Untitled Report' }),
  createdOn:      DS.attr('moment'),
  updatedOn:      DS.attr('moment'),
  author:         DS.belongsTo('user', {async: true}),
  request:        MF.fragment('bard-request/request', { defaultValue: {} }),
  deliveryRules:  DS.hasMany('deliveryRule', { async: true, inverse: 'deliveredItem' }),

  /**
   * @property {String} tempId - uuid for unsaved records
   */
  tempId: computed('id', function() {
    if(get(this, 'id')) {
      return null;
    } else {
      return v1();
    }
  }),

  /**
   * @property {Service} user
   */
  user: Ember.inject.service(),

  /**
   * @property {Boolean} isOwner - is owner of report
   */
  isOwner: computed(function() {
    let user = get(this, 'user').getUser();
    return get(this, 'author.id') === get(user, 'id');
  }),

  /**
   * @property {Boolean} isFavorite - is favorite of author
   */
  isFavorite: computed(function() {
    let user = get(this, 'user').getUser(),
        favoriteReports = user.hasMany('favoriteReports').ids();

    return arr(favoriteReports).includes(get(this, 'id'));
  }).volatile(),

  /**
   * @property {DS.Model} deliveryRuleForUser - delivery rule model
   */
  deliveryRuleForUser: computed('user', 'deliveryRules.[]', function() {
    let userId = get(get(this, 'user').getUser(), 'id');

    return DS.PromiseObject.create({
      promise: get(this, 'deliveryRules').then(rules =>
        arr(rules.filter( rule => rule.get('owner.id') === userId )).get('firstObject')
      )
    });
  }),

  /**
   * Clones the model
   *
   * @method clone
   * @returns Object - cloned Report model
   */
  clone() {
    let clonedReport = this.toJSON();

    return {
      title: clonedReport.title,
      visualization: this.store.createFragment(clonedReport.visualization.type, clonedReport.visualization),
      request: get(this, 'request').clone()
    };
  }
});

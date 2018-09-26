/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  /**
   * @overide
   * @method redirect
   * @param {DS.Model} model - report model record
   */
  redirect(model) {
    this.replaceWith('reports.report.view', Ember.get(model, 'id'));
  }
});

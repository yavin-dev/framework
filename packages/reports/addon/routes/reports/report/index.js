/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  /**
   * @overide
   * @method redirect
   * @param {DS.Model} model - report model record
   */
  redirect(model) {
    this.replaceWith('reports.report.view', get(model, 'modelId'));
  },
});

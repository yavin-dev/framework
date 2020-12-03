/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * @overide
   * @method redirect
   * @param {DS.Model} model - report model record
   */
  redirect(model, transition) {
    this.replaceWith('reports-print.reports.report.view', model.id, { queryParams: transition.to?.queryParams });
  }
});

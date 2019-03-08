/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { get } from '@ember/object';

import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * @overide
   * @method redirect
   * @param {DS.Model} model - report model record
   */
  redirect(model) {
    this.replaceWith('print.reports.report.view', get(model, 'id'));
  }
});

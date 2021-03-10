/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class ReportsReportEditRoute extends Route {
  @action
  didTransition() {
    this.send('setReportState', 'editing');
    return true; // Bubble the didTransition event
  }
}

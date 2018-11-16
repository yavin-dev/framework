/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';

export default Route.extend({
  actions: {
    didTransition() {
      this.send('setReportState', 'editing');
      return true; // Bubble the didTransition event
    }
  }
});

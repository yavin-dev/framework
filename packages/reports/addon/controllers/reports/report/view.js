/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import { computed } from '@ember/object';
import isEqual from 'lodash/isEqual';

export default Ember.Controller.extend({
  /*
   * @property {Controller} reportController
   */
  reportController: Ember.inject.controller('reports.report'),

  /*
   * @property {Boolean} hasRequestRun
   */
  hasRequestRun: computed('reportController.modifiedRequest', 'model.request', function() {
    const modifiedRequest = this.get('reportController.modifiedRequest');

    if (!modifiedRequest) {
      // no changes have been made yet
      return true;
    }

    return isEqual(modifiedRequest, this.model.get('request'));
  })
});

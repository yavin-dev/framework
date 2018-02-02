/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#common-actions/share
 *      pageTitle=nameOfPageToShare
 *      buildUrl=(action 'optionalCodeForGeneratingUrlToShare')
 *   }}
 */
import Ember from 'ember';
import layout from '../../templates/components/common-actions/share';

const { get, computed } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {String} pageTitle - name of page being shared
   */
  pageTitle: undefined,

  /**
   * @property {String} currentUrl
   */
  currentUrl: computed(function() {
    // Allow custom url logic for sharing something other than current page
    let buildUrl = get(this, 'buildUrl');
    if (buildUrl) {
      return buildUrl();
    }

    return document.location.href;
  }).volatile()
});

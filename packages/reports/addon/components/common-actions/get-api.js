/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#common-actions/get-api
 *      request=model.request
 *      buttonClassNames='string of classes to apply to the button element'
 *      beforeAction=(action 'runThisFirst')
 *   }}
 *      Inner template
 *   {{/common-actions/get-api}}
 */
import Ember from 'ember';
import layout from '../../templates/components/common-actions/get-api';

const { get, set } = Ember;

export default Ember.Component.extend({
  layout,

  classNames: ['get-api'],

  /**
   * @property {Service} facts - instance of bard facts service
   */
  facts: Ember.inject.service('bard-facts'),

  /**
   * @property {String} requestUrl - API link
   */
  requestUrl: Ember.computed('request', 'showModal', function() {
    // Observe 'showModal' to recompute each time the modal opens
    let request = get(this, 'request').serialize();
    return get(this, 'facts').getURL(request);
  }),

  actions: {
    /**
     * Sets the notifications to false, used when modal is closed to clean it up.
     */
    resetNotifications() {
      set(this, 'successNotification', false);
      set(this, 'errorNotification', false);
    }
  }
});

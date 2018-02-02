/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#report-actions/multiple-format-export
 *      report=report
 *   }}
 *      Inner template
 *   {{/report-actions/multiple-format-export}}
 */

import Ember from 'ember';
import layout from '../../templates/components/report-actions/multiple-format-export';

const { get, getProperties } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} list of class names given to element
   */
  classNames: ['report-control', 'multiple-format-export'],

  /**
   * @property {Service} facts - instance of bard facts service
   */
  facts: Ember.inject.service('bard-facts'),

  /**
   * @property {Service} modelCompression
   */
  modelCompression: Ember.inject.service(),

  /**
   * @property {Service} store
   */
  store: Ember.inject.service(),

  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: Ember.inject.service(),

  /**
   * @property {String} csvHref - CSV download link for the report
   */
  csvHref: Ember.computed('report.request', 'report.validations.isTruelyValid', function () {
    let request = get(this, 'report.request').serialize();
    return get(this, 'facts').getURL(request, { format: 'csv' });
  }),

  /**
   * @property {Promise} pdfHref - Promise resolving to pdf download link
   */
  pdfHref: Ember.computed('report.request', 'report.visualization', 'report.validations.isTruelyValid', function () {
    let { report, modelCompression, store } = getProperties(this, 'report', 'modelCompression', 'store'),
        modelWithId = report;

        /*
         * Model compression requires an id, so if the report doesn't have one,
         * create a copy using the tempId as the id
         */
    if (!get(report, 'id')) {
      modelWithId = store.createRecord('report', report.clone());
      modelWithId.set('id', get(modelWithId, 'tempId'));
    }

    return modelCompression.compress(modelWithId).then(serializedModel =>
      `/export?reportModel=${serializedModel}`
    );
  }),

  /**
   * @property {Array} exportFormats - A list of export formats
   */
  exportFormats: Ember.computed('csvHref', 'pdfHref', function() {
    return [
      {
        type: 'CSV',
        href: get(this, 'csvHref'),
        icon: 'file-text-o'
      },
      {
        type: 'PDF',
        href: get(this, 'pdfHref'),
        icon: 'file-pdf-o'
      }
    ];
  }),

  actions: {
    /*
     * @action open
     * A hack to make the trigger responding to click
     */
    open() {
      return true;
    },

    /**
     * @action close
     */
    close(dropdown) {
      dropdown.actions.close();
    },

    /**
     * Lets the user know to wait for the export download
     * @action notify
     * @param {String} type - user readable name for the selected export option
     */
    notify(type) {
      get(this, 'naviNotifications').add({
        message: `${type}? Got it. The download should begin soon.`,
        type: 'success',
        timeout: 'medium'
      });
    }
  }
});

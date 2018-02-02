/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{visualization-config/metric-label
 *    request=request
 *    response=response
 *    options=options
 *  }}
 */
import Ember from 'ember';
import layout from '../../templates/components/visualization-config/metric-label';

const { get, computed } = Ember;

export default Ember.Component.extend({
  /**
   * @property {Object} layout
   */
  layout,

  /**
   * @property {Array} predefinedFormats
   * list of format types shown to the user
   */
  predefinedFormats: [
    {name: 'Number', format: '0,0.00', class: "metric-label-config__radio-number"},
    {name: 'Decimal', format: '0.000', class: "metric-label-config__radio-decimal"},
    {name: 'Nice Number', format: '0.0a', class: "metric-label-config__radio-nice-number"},
    {name: 'Money', format: '$0,0[.]00', class: "metric-label-config__radio-money"}
  ],

  /**
   * @property {String} customFormat
   * returns empty string if the current format
   * is one of the predefined formats
   */
  customFormat: computed('options.format', function() {
    let predefinedFormats = Ember.A(get(this, 'predefinedFormats')),
        currentFormat = get(this, 'options.format'),
        match = predefinedFormats.findBy('format', currentFormat);
    return match ? '' : currentFormat;
  }),

  /**
   * @property {Array} classNames
   */
  classNames: ['metric-label-config'],

  actions: {
    /**
     * @action updateLabel
     */
    updateLabel(description) {
      this.sendAction('onUpdateConfig', { description });
    },

    /**
     * @action updateFormat
     */
    updateFormat(format) {
      this.sendAction('onUpdateConfig', { format });
    },

    /**
     * @action clearFormat
     * format is cleared after selecting the custom format type
     */
    clearFormat() {
      this.sendAction('onUpdateConfig', { format: '' });
    }
  }
});

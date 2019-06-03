/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{navi-widget
 *      model=widgetModel
 *      data=dataPromiseObject
 *      layoutOptions=layoutObject
 *      canEdit=true
 *   }}
 */
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from '../templates/components/navi-widget';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName - don't add a wrapper tag for this component
   */
  tagName: '',

  /**
   * @property {String} visualizationPrefix - prefix for all visualizations types
   */
  visualizationPrefix: 'navi-visualizations/',

  /**
   * @property {Object} widget - model for widget
   */
  model: undefined,

  /**
   * @property {DS.PromiseObject} data - data for widget
   */
  data: undefined,

  /**
   * @property {Object} layoutOptions - layout for dashboard presentation
   */
  layoutOptions: undefined,

  /**
   * @property {Object} options - object for grid-stack-item
   */
  options: computed('layoutOptions', function() {
    let layout = get(this, 'layoutOptions'),
      id = get(this, 'model.id');

    if (layout) {
      // Map layout to gridstack options
      let { column: x, row: y, height, width } = layout;
      return { id, x, y, height, width };
    }
  }),

  /**
   * @property {String} filterErrors - Error messaging for filters that couldn't be applied to the widget
   */
  filterErrors: computed('data.isFulfilled', function() {
    const filterErrors = get(this, 'data.firstObject.response.meta.errors') || [];
    const filterErrorMessages = filterErrors
      .filter(e => e.title === 'Invalid Filter')
      .map(e => e.detail)
      .join('\n');

    return filterErrorMessages ? `Unable to apply filter(s):\n${filterErrorMessages}` : null;
  })
});

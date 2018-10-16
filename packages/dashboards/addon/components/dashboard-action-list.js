/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@ember/component';
import layout from '../templates/components/dashboard-action-list';
import BuildUrl from 'navi-reports/mixins/build-url';

export default Component.extend(BuildUrl, {
  layout,

  /**
   * @property {String} tagName
   */
  tagName: 'ul',

  /**
   * @property {Array} classNames
   */
  classNames: ['actions']
});

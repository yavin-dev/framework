/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@ember/component';
import BuildUrl from 'navi-reports/mixins/build-url';
import layout from '../templates/components/navi-action-list';

export default Component.extend(BuildUrl, {
  layout,

  /**
   * @property {String} tagName
   * @override
   */
  tagName: 'ul'
});

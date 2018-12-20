/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage: {{navi-loader
 *          containerClass='container' -- optional
 *        }}
 */
import Ember from 'ember';
import layout from '../templates/components/navi-loader';

export default Ember.Component.extend({
  layout,

  tagName: '',

  /**
   * @property containerClass - additional class for navi-loader__container
   */
  containerClass: undefined
});

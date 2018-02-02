/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import layout from '../templates/components/dashboard-action-list';

export default Ember.Component.extend({
  layout,

  tagName: 'ul',

  classNames: [ 'actions' ]
});

/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import User from 'navi-reports/models/user';

export function initialize(/* application */) {
  User.reopen({
    dashboards:         DS.hasMany('dashboard', {async: true, inverse: 'author'}),
    favoriteDashboards: DS.hasMany('dashboard', {async: true, inverse: null})
  });
}

export default {
  name: 'user-model',
  initialize
};

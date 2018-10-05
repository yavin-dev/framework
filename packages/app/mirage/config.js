/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import config from 'navi-app/config/environment';
import BardLite from 'navi-data/mirage/routes/bard-lite';
import BardMeta from './bard-meta-stub';
import Reports from 'navi-app/mirage/routes/user-and-report';
import Dashboard from 'navi-app/mirage/routes/dashboard';
import DashboardWidget from 'navi-app/mirage/routes/dashboard-widget';
import DashboardCollection from 'navi-app/mirage/routes/dashboard-collection';

export default function() {
  // https://github.com/kategengler/ember-cli-code-coverage#create-a-passthrough-when-intercepting-all-ajax-requests-in-tests
  this.passthrough('/write-coverage');

  // Mock bard facts + metadata
  this.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  BardLite.call(this);
  BardMeta.call(this);

  // Mock persistence
  this.urlPrefix = config.navi.appPersistence.uri;
  Reports.call(this)
    .withUserRelationship({
      property: 'dashboards',
      type: 'dashboards',
      relation: 'hasMany'
    })
    .withUserRelationship({
      property: 'favoriteDashboards',
      type: 'dashboards',
      relation: 'hasMany'
    });
  Dashboard.call(this);
  DashboardWidget.call(this);
  DashboardCollection.call(this);
}

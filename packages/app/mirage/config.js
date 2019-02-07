/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import config from 'navi-app/config/environment';
import BardLite from 'navi-data/mirage/routes/bard-lite';
import BardMeta from './bard-meta-stub';
import user from 'navi-app/mirage/routes/user';
import report from 'navi-app/mirage/routes/report';
import dashboard from 'navi-app/mirage/routes/dashboard';
import dashboardCollection from 'navi-app/mirage/routes/dashboard-collection';
import reportCollection from 'navi-app/mirage/routes/report-collections';
import dashboardWidget from 'navi-app/mirage/routes/dashboard-widget';

export default function() {
  // https://github.com/kategengler/ember-cli-code-coverage#create-a-passthrough-when-intercepting-all-ajax-requests-in-tests
  this.passthrough('/write-coverage');

  // Mock bard facts + metadata
  this.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  BardLite.call(this);
  BardMeta.call(this);

  // Mock persistence
  this.urlPrefix = config.navi.appPersistence.uri;
  dashboard.call(this);
  dashboardCollection.call(this);
  reportCollection.call(this);
  dashboardWidget.call(this);
  user.call(this);
  report.call(this);
}

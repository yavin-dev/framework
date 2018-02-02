import config from 'ember-get-config';
import factService from 'navi-data/mirage/routes/bard-lite';
import metaService from 'navi-data/mirage/routes/bard-meta';
import usersAndReports from './routes/user-and-report';
import dashboard from './routes/dashboard';
import dashboardCollection from './routes/dashboard-collection';
import dashboardWidget from './routes/dashboard-widget';

export default function() {

  // https://github.com/kategengler/ember-cli-code-coverage#create-a-passthrough-when-intercepting-all-ajax-requests-in-tests
  this.passthrough('/write-coverage');

  /* == Mock Fact Data == */
  this.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  metaService.call(this);
  factService.call(this);

  /* == Mock Persistence == */
  this.urlPrefix = config.navi.appPersistence.uri;
  dashboard.call(this);
  dashboardCollection.call(this);
  dashboardWidget.call(this);
  usersAndReports.call(this).withUserRelationship({
    property: 'dashboards',
    type: 'dashboards',
    relation: 'hasMany'
  }).withUserRelationship({
    property: 'favoriteDashboards',
    type: 'dashboards',
    relation: 'hasMany'
  });
}

import config from 'ember-get-config';
import BardLite from 'navi-data/mirage/routes/bard-lite';
import BardMeta from 'navi-data/mirage/routes/bard-meta';
import user from './routes/user';
import report from './routes/report';
import role from './routes/role';
import dashboard from './routes/dashboard';
import dashboardCollection from './routes/dashboard-collection';
import reportCollection from './routes/report-collections';
import dashboardWidget from './routes/dashboard-widget';
import deliveryRules from './routes/delivery-rules';
import querystat from './routes/querystat';

export default function() {
  // https://github.com/kategengler/ember-cli-code-coverage#create-a-passthrough-when-intercepting-all-ajax-requests-in-tests
  this.passthrough('/write-coverage');

  /* == Mock Fact Data == */
  this.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  BardMeta.call(this);
  BardLite.call(this);

  this.urlPrefix = `${config.navi.dataSources[1].uri}/v1`;
  BardMeta.call(this);
  BardLite.call(this);

  /* == Mock Persistence == */
  this.urlPrefix = config.navi.appPersistence.uri;
  dashboard.call(this);
  dashboardCollection.call(this);
  reportCollection.call(this);
  dashboardWidget.call(this);
  deliveryRules.call(this);
  user.call(this);
  report.call(this);
  role.call(this);
  querystat.call(this);

  // this.namespace = '/admin';
  // this.get('/querystats');
  // this.get('/querystats', () => ({
  //   querystats: [
  //     { id: 1, text: 'Row 1' },
  //     { id: 2, text: 'Row 2' },
  //     { id: 3, text: 'row 3' }
  //   ]
  // }));
}

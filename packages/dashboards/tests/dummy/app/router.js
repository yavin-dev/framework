import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('directory', function() {
    this.route('my-directory');
  });

  this.route('dashboardCollections', function() {
    this.route('collection', { path: '/:collectionId' });
  });
  this.route('dashboards', function() {
    this.route('new');

    this.route('dashboard', { path: '/:dashboardId'}, function() {
      this.route('clone');
      this.route('view');

      this.route('widgets', function() {
        this.route('add');
        this.route('new');
        this.route('widget', { path: '/:widgetId'}, function() {
          this.route('clone-to-report');
          this.route('new');
          this.route('view');
          this.route('invalid');
        });
      });
    });
  });

  this.route('print', function () {
    this.route('dashboards', function () {  
      this.route('dashboard', { path: '/:dashboardId' }, function () {
        this.route('view');
      });
    });
  })
  
  this.route('reports', function() {
    this.route('report', { path: '/:reportId'}, function() {
      this.route('view');
      this.route('clone');
      this.route('edit');
    });
  });
});

export default Router;

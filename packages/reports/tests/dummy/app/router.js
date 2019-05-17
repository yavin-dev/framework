import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('reports', function() {
    this.route('new');
    this.route('report', { path: '/:report_id' }, function() {
      this.route('clone');
      this.route('save-as');
      this.route('invalid');
      this.route('edit');
      this.route('view');
      this.route('unauthorized');
    });
  });

  this.route('directory', function() {
    this.route('my-data');
  });

  this.route('report-collections', function() {
    this.route('collection', { path: '/:collection_id' });
  });

  this.route('print', function() {
    this.route('reports', function() {
      this.route('new');
      this.route('report', { path: '/:report_id' }, function() {
        this.route('view');
        this.route('invalid');
      });
    });
  });
});

export default Router;

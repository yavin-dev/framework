import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('helpers', function() {
    this.route('child1', function() {
      this.route('child2');
    });
  });
});

export default Router;

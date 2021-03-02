import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { adminRoutes } from 'navi-admin/router';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  adminRoutes(this);
});

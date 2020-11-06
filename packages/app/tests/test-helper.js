import Application from '../app';
import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

//App Settings for Testing in CI mode
window.NAVI_APP = {
  dataSources: [{ name: 'default', uri: 'https://fact.naviapp.io', type: 'bard' }],
  appPersistence: {
    uri: 'https://persistence.naviapp.io',
    type: 'elide',
    timeout: 90000
  },
  user: 'navi_user'
};

setApplication(Application.create(config.APP));

registerWaiter();

start();

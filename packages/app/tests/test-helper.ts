// @ts-ignore
import Application from '../app';
// @ts-ignore
import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

//App Settings for Testing in CI mode
(window as any).NAVI_APP = {
  appSettings: {
    factApiHost: 'https://fact.naviapp.io',
    persistenceApiHost: 'https://persistence.naviapp.io',
    user: 'navi_user'
  }
};

setApplication(Application.create(config.APP));

registerWaiter();

start();

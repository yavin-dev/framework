import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

//App Settings for Testing in CI mode
window.NAVI_APP = {
  appSettings: {
    factApiHost: 'https://fact.naviapp.io',
    persistenceApiHost: 'https://persistence.naviapp.io',
    user: 'navi_user'
  }
};

start();

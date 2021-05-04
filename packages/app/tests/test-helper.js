import Application from 'navi-app/app';
import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';
import config from 'navi-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

//App Settings for Testing in CI mode
window.NAVI_APP = {
  dataSources: [
    {
      name: 'default',
      displayName: 'Default',
      uri: 'https://fact.naviapp.io',
      type: 'bard',
    },
  ],
  appPersistence: {
    uri: 'https://persistence.naviapp.io',
    type: 'elide',
    timeout: 90000,
  },
  user: 'navi_user',
};

setApplication(Application.create(config.APP));

registerWaiter();

setup(QUnit.assert);

start();

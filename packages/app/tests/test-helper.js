import resolver from './helpers/resolver';
import './helpers/flash-message';

import {
  setResolver
} from 'ember-qunit';
import { start } from 'ember-cli-qunit';

setResolver(resolver);

//App Settings for Testing in CI mode
window.NAVI_APP = {
  appSettings: {
    factApiHost: 'https://fact.naviapp.io',
    persistenceApiHost: 'https://persistence.naviapp.io',
    user: 'navi_user'
  }
};
start();

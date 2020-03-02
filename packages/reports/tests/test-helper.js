import Application from '../app';
import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

registerWaiter();

start();

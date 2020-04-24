// @ts-ignore
import Application from '../app';
// @ts-ignore
import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

// Install types for qunit-dom
import 'qunit-dom';

setApplication(Application.create(config.APP));

registerWaiter();

start();

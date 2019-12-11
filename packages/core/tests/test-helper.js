import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

const application = Application.create(config.APP);

setApplication(application);
start();

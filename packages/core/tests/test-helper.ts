// @ts-ignore
import Application from '../app';
import config from '../config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

// Install types for qunit-dom
import 'qunit-dom';

const application = Application.create(config.APP);

setApplication(application);
setup(QUnit.assert);
start();

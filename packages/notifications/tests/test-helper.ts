// @ts-ignore
import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import 'qunit-dom'; // Install types for qunit-dom
import './helpers/flash-message';

setup(QUnit.assert);
setApplication(Application.create(config.APP));

start();

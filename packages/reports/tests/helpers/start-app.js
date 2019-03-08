import Application from '../../app';
import config from '../../config/environment';
import { merge } from '@ember/polyfills';
import { run } from '@ember/runloop';

import registerPowerSelectHelpers from 'ember-power-select/test-support/helpers';
import registerBasicDropdownHelpers from 'ember-basic-dropdown/test-support/helpers';
import './ember-sortable/test-helpers';
import '../helpers/visit-without-wait';
import '../helpers/wait-for-element';
registerPowerSelectHelpers();
registerBasicDropdownHelpers();

export default function startApp(attrs) {
  let attributes = merge({}, config.APP);
  attributes.autoboot = true;
  attributes = merge(attributes, attrs); // use defaults, but you can override;

  return run(() => {
    let application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
}

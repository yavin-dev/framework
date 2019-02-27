import Application from '../../app';
import config from '../../config/environment';
import { assign } from '@ember/polyfills';
import { run } from '@ember/runloop';

import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';
import registerPowerSelectHelpers from 'ember-power-select/test-support/helpers';
import registerBasicDropdownHelpers from 'ember-basic-dropdown/test-support/helpers';
import './ember-sortable/test-helpers';
registerWaiter();
registerPowerSelectHelpers();
registerBasicDropdownHelpers();

export default function startApp(attrs) {
  let attributes = assign({}, config.APP);
  attributes = assign(attributes, attrs); // use defaults, but you can override;

  return run(() => {
    let application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
}

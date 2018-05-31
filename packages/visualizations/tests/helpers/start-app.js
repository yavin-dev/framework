import Application from '../../app';
import config from '../../config/environment';
import { merge } from '@ember/polyfills';
import { run } from '@ember/runloop';

//import ember-sortable helpers
import './ember-sortable/test-helpers';

import registerBasicDropdownHelpers from 'ember-basic-dropdown/test-support/helpers';
import registerPowerSelectHelpers from '../../tests/helpers/ember-power-select';
registerBasicDropdownHelpers();
registerPowerSelectHelpers();

export default function startApp(attrs) {
  let attributes = merge({}, config.APP);
  attributes = merge(attributes, attrs); // use defaults, but you can override;

  return run(() => {
    let application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
}

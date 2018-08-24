import Ember from 'ember';
import { initialize } from 'dummy/initializers/inject-c3-enhancements';
import { module, test } from 'ember-qunit';
import destroyApp from '../../helpers/destroy-app';

module('Unit | Initializer | inject c3 enhancements', {
  beforeEach() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.application.deferReadiness();
    });
  },
  afterEach() {
    destroyApp(this.application);
  }
});

test('function overrides', function(assert) {
  initialize(this.application);

  assert.equal(c3.chart.internal.fn.getGaugeLabelHeight(),
    100,
    'c3 function overrides are present');
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type ClientInjector from 'navi-data/services/client-injector';

let Service: ClientInjector;

module('Unit | Service | client-injector', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    Service = this.owner.lookup('service:client-injector');
  });

  test('it looks up ember services', function (assert) {
    assert.strictEqual(
      Service.lookup('service', 'navi-dimension'),
      this.owner.lookup('service:navi-dimension'),
      'write a real test'
    );
  });
});

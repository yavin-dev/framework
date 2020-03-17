import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Container, ServiceFactory;

module('Unit | Service | navi-notifications', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Container = this.owner;
    ServiceFactory = Container.factoryFor('service:navi-notifications');
  });

  test('add notification options', function(assert) {
    assert.expect(2);
    const service = ServiceFactory.create();

    service.notificationService = {
      queue: [],
      add() {}
    };

    const assertThat = (input, output, message) => {
      service.notificationService.add = options => assert.deepEqual(options, output, message);
      service.add(input);
    };

    assertThat(
      { message: 'e', timeout: 'short' },
      { message: 'e', timeout: 3000 },
      'The timeout alias is mapped to the duration'
    );
    assertThat({ message: 'e', timeout: 23 }, { message: 'e', timeout: 23 }, 'A number as a timeout is not modified');
  });
});

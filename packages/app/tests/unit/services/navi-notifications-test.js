import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | navi notifications', function(hooks) {
  setupTest(hooks);

  test('clearMessages', function(assert) {
    assert.expect(2);

    let service = this.owner.lookup('service:navi-notifications'),
        message = 'Some message',
        flashMessagesService = service.get('notificationService');

    flashMessagesService.add({
      message
    });

    assert.deepEqual(flashMessagesService.get('queue').mapBy('message'),
      [message],
      'Notification queue contains a message initially');

    service.clearMessages();

    assert.deepEqual(flashMessagesService.get('queue').mapBy('message'),
      [],
      'clearMessages clears messages in the notification queue');
  });

  test('add', function(assert) {
    assert.expect(3);

    let service = this.owner.lookup('service:navi-notifications'),
        message = 'Some message',
        flashMessagesService = service.get('notificationService');

    assert.deepEqual(flashMessagesService.get('queue').mapBy('message'),
      [],
      'Notification queue contains no messages initially');

    service.add({
      message
    });

    assert.deepEqual(flashMessagesService.get('queue').mapBy('message'),
      [message],
      'add method adds a message in the notification queue');

    service.add({
      message
    });

    assert.deepEqual(flashMessagesService.get('queue').mapBy('message'),
      [message],
      'add method does not add duplicate messages');
  });
});

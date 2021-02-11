import { triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { triggerCopySuccess } from 'ember-cli-clipboard/test-support';
import Service from '@ember/service';

let NotificationCallback;

module('Acceptance | share link', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(function() {
    this.owner.register(
      'service:navi-notifications',
      class extends Service {
        add(options) {
          NotificationCallback(options);
        }
      }
    );
  });

  test('dashboard share link', async function(assert) {
    assert.expect(1);

    const baseUrl = document.location.origin;
    NotificationCallback = ({ context }) => {
      assert.equal(context, `${baseUrl}/dashboards/1`, 'The share link is built correctly by buildDashboardUrl');
    };

    await visit('/dashboards');
    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await triggerCopySuccess('.navi-collection__row0 .share__action-btn');
  });
});

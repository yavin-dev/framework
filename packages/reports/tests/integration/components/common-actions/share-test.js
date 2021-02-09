import $ from 'jquery';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { triggerCopySuccess } from 'ember-cli-clipboard/test-support';

let Template, NotificationCallback;

module('Integration | Component | common actions/share', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    NotificationCallback = () => null;

    this.owner.register(
      'service:navi-notifications',
      class extends Service {
        add(options) {
          NotificationCallback(options);
        }
      }
    );

    Template = hbs`
      <CommonActions::Share
        class="share"
        @pageTitle={{this.pageTitle}}
        @buildUrl={{this.buildUrl}}
        @disabled={{this.isDisabled}}
      >
        Share Report
      </CommonActions::Share>
    `;
  });

  test('Component renders', async function(assert) {
    assert.expect(2);

    await render(Template);

    assert.dom('.share').hasText('Share Report', 'Component yields given text');

    NotificationCallback = ({ context }) => {
      assert.equal(context, document.location, 'share uses the current location as the default share url');
    };

    await render(Template);

    // Click component
    await triggerCopySuccess('.share__action-btn');
  });

  test('Component is enabled / disabled', async function(assert) {
    assert.expect(2);

    this.set('isDisabled', true);

    await render(Template);

    assert.ok($('button:contains("Share")').prop('disabled'), 'Share is disabled when the disabled is set to true');

    this.set('isDisabled', false);

    assert.notOk($('button:contains("Share")').prop('disabled'), 'Share is enabled when the disabled is set to false');
  });

  test('buildUrl option', async function(assert) {
    assert.expect(1);

    const url = 'www.navi.com/customUrlToShare';
    this.set('buildUrl', () => url);
    NotificationCallback = ({ context }) => {
      assert.equal(context, url, 'share uses `buildUrl` arg to produce a share url');
    };

    await render(Template);

    // Click component
    await triggerCopySuccess('.share__action-btn');
  });
});

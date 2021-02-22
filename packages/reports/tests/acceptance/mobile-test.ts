import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
//@ts-expect-error
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext } from 'ember-test-helpers';
import Service from '@ember/service';

module('Acceptance | Mobile test', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.owner.register(
      'service:screen',
      class extends Service {
        isMobile = true;
      }
    );
  });

  test('verify the different time grains work as expected - bard', async function (assert) {
    await visit('/reports/1/edit');

    assert.dom('.navi-column-config__panel').doesNotExist('The column config panel is collapsed on mobile');
    assert.dom('.report-builder__container--filters--collapsed').exists('The filters are collapsed on mobile view');
  });
});

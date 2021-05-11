import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';

module('Acceptance | report builder sidebar', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  test('sidebar opens and closes', async function (assert) {
    await visit('/reports/1/edit');

    assert.dom('.report-builder-sidebar__header').exists('The sidebar is visible on report open');

    await click('.report-builder-sidebar__close');
    await animationsSettled();

    assert.dom('.report-builder-sidebar__header').doesNotExist('The sidebar is closed');

    await click('.report-builder__sidebar-open');
    await animationsSettled();

    assert.dom('.report-builder-sidebar__header').exists('The sidebar is visible again');
  });

  test('sidebar on smaller screens - existing report', async function (assert) {
    this.owner.lookup('service:screen').isMobile = true;
    await visit('/reports/1/edit');

    assert
      .dom('.report-builder-sidebar__header')
      .doesNotExist('The sidebar is not visible on small screens when an existing report is loaded');
  });

  test('sidebar on smaller screens - new report', async function (assert) {
    this.owner.lookup('service:screen').isMobile = true;
    await visit('/reports/new');

    assert
      .dom('.report-builder-sidebar__header')
      .exists('The sidebar is visible on small screens when a new report is created');
  });
});

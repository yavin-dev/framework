import { click, findAll, currentURL, visit, fillIn, blur } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support';
//@ts-ignore
import { clickItem } from 'navi-reports/test-support/report-builder';

module('Acceptance | Dashboard Editor', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  test('As an dashboard editor, add, clone & remove a widget', async function (assert) {
    //Initial state
    await visit('/dashboards/3');
    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Mobile DAU Goal'],
      'Dashboard initially has one widget'
    );

    // Create new widget
    await click('.dashboard-header__add-widget-btn');
    await click('.add-widget__new-btn');
    await click('.report-builder-source-selector__source-button[data-source-name="Bard One"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Network"]');
    await animationsSettled();

    // Fill out request
    await selectChoose('.filter-builder__operator-trigger', 'In The Past');
    await clickItem('dimension', 'Date Time');
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Day');
    await clickItem('metric', 'Total Clicks');

    await click('.navi-report-widget__save-btn');
    const NEW_WIDGET_ID = 21;
    assert.equal(
      currentURL(),
      `/dashboards/3/view?highlightWidget=${NEW_WIDGET_ID}`,
      'After saving without running, user is brought back to dashboard view'
    );
    assert.dom(`[gs-id="${NEW_WIDGET_ID}"]`).exists('next widget is present');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Mobile DAU Goal', 'Untitled Widget'],
      'An editor can add a widget'
    );

    await click('.navi-widget__delete-btn');
    await click('.delete__modal-delete-btn');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Untitled Widget'],
      'An editor can remove a widget'
    );

    await click('.navi-widget__clone-btn');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Untitled Widget', 'Copy of Untitled Widget'],
      'An editor can clone a widget'
    );
  });

  test('As an dashboard editor, edit a widget', async function (assert) {
    await visit('/dashboards/3');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Mobile DAU Goal'],
      'Dashboard widget has an initial title'
    );

    //Update widget title
    await click('.navi-widget__edit-btn');
    await click('.editable-label__icon');
    await fillIn('.editable-label__input', 'A new title');
    await blur('.editable-label__input');
    await click('.navi-report-widget__save-btn');
    await click(findAll('.navi-report-widget__breadcrumb-link')[1]);

    assert.ok(
      currentURL().endsWith('/dashboards/3/view'),
      'After saving without running, user is brought back to dashboard view'
    );

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['A new title'],
      'An editor can add a widget'
    );
  });

  test('As an dashboard editor, edit the title', async function (assert) {
    await visit('/dashboards/3');
    await click('.editable-label__icon');
    await fillIn('.editable-label__input', 'A new title');
    await blur('.editable-label__input');

    assert
      .dom('.dashboard-header__page-title')
      .hasText('A new title', 'New Dashboard title is persisted with value `A new title` ');
  });
});

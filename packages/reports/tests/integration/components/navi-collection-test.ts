import Component from '@glimmer/component';
import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import findByContains from 'navi-core/test-support/contains-helpers';

const REPORTS = ArrayProxy.create({
  isSettled: true, // Mock a loaded promise array
  content: A([
    {
      id: 1,
      title: 'Hyrule News',
      updatedOn: '2015-01-01 00:00:00',
      isFavorite: false,
    },
    {
      id: 2,
      title: 'Hyrule Ad&Nav Clicks',
      updatedOn: '2015-01-01 00:00:00',
      isFavorite: true,
    },
    {
      title: 'Unsaved report',
      updatedOn: '2015-01-01 00:00:00',
      isFavorite: false,
    },
    {
      id: 10,
      title: 'No Data Report',
      updatedOn: '2016-02-10 17:00:44',
      isFavorite: true,
    },
  ]),
});

const TEMPLATE = hbs`
<NaviCollection
  @items={{this.items}}
  @itemType={{this.itemType}}
  @itemNewRoute={{this.itemNewRoute}}
  @config={{hash actions=this.actions filterable=this.filterable emptyMsg=this.emptyMsg}}
/>`;

module('Integration | Component | navi collection', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    // suppress report-actions/export component inside integration tests, since we are not testing it here
    this.owner.register('component:report-actions/export', class extends Component {}, { instantiate: false });
  });

  test('Table filtering', async function (assert) {
    assert.expect(2);

    this.set('filterable', true);
    this.set('items', REPORTS);

    await render(TEMPLATE);

    // Click "Favorites" filter option
    await selectChoose('.navi-collection__filter-trigger', 'All');

    let listedReports = findAll('tbody tr td:first-of-type').map((el) => el.textContent?.trim());

    assert.deepEqual(
      listedReports,
      ['Hyrule News', 'Hyrule Ad&Nav Clicks', 'Unsaved report', 'No Data Report'],
      'By default, all reports with an id are listed'
    );

    // Click "Favorites" filter option
    await selectChoose('.navi-collection__filter-trigger', 'Favorites');
    listedReports = findAll('tbody tr td:first-of-type').map((el) => el.textContent?.trim());

    assert.deepEqual(
      listedReports,
      ['Hyrule Ad&Nav Clicks', 'No Data Report'],
      'After selecting favorite filter, only favorite reports are shown'
    );
  });

  test('Favorite icon', async function (assert) {
    this.set('items', REPORTS);

    await render(TEMPLATE);

    assert
      .dom(findByContains('td', 'Hyrule News').querySelector('.favorite-item--active'))
      .doesNotExist('Report that is not a favorite does not have favorite icon');

    assert
      .dom(findByContains('td', 'Hyrule Ad&Nav Clicks').querySelector('i'))
      .hasClass('favorite-item--active', 'Report that is a favorite has favorite icon');
  });

  test('Filterable Table', async function (assert) {
    assert.expect(2);

    this.set('items', REPORTS);

    this.set('filterable', false);
    await render(TEMPLATE);

    assert
      .dom('.navi-collection__filter-selector')
      .isNotVisible('Filter dropdown is not shown when `filterable` flag is not set to true in collection config');

    this.set('filterable', true);

    assert
      .dom('.navi-collection__filter-selector')
      .isVisible('Filter dropdown is shown when `filterable` flag is set to true in collection config');
  });

  test('Actions in Table', async function (assert) {
    assert.expect(2);

    this.set('items', REPORTS);

    this.set('filterable', false);
    await render(TEMPLATE);

    assert
      .dom('.navi-collection .navi-collection__actions')
      .doesNotExist('Actions column is not shown when `actions` component is missing from collection config');

    this.owner.register('component:mock-actions-component', class extends Component {}, {
      instantiate: false,
    });

    this.set('actions', 'mock-actions-component');
    await render(TEMPLATE);

    assert
      .dom('.navi-collection .navi-collection__actions')
      .exists('Actions column is shown when `actions` component is in the collection config');
  });

  test('Error Message - default', async function (assert) {
    assert.expect(2);

    this.set(
      'items',
      ArrayProxy.create({
        isSettled: true,
        content: A(),
      })
    );

    this.set('itemType', 'reports');
    this.set('itemNewRoute', 'customReports.new');
    await render(TEMPLATE);

    assert.deepEqual(
      find('.navi-collection .no-results')?.textContent?.trim(),
      `You don't have any reports yet. Go ahead and create one now?`,
      'Default message is shown when no items are rendered'
    );

    assert
      .dom('.navi-collection .no-results a')
      .exists('Default message is shown when no items are rendered with a link');
  });

  test('Error Message - custom', async function (assert) {
    assert.expect(1);

    this.set(
      'items',
      ArrayProxy.create({
        isSettled: true,
        content: A(),
      })
    );

    this.set('emptyMsg', 'You have no custom reports. Create one now.');
    await render(TEMPLATE);

    assert.deepEqual(
      find('.navi-collection .no-results')?.textContent?.trim(),
      'You have no custom reports. Create one now.',
      'Custom message is shown when no items are rendered'
    );
  });
});

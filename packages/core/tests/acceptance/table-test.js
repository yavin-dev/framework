import { click, fillIn, findAll, blur, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import config from 'ember-get-config';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';
import reorder from '../helpers/reorder';

module('Acceptance | table', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;
  });

  hooks.afterEach(function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
  });

  test('visiting /table', async function(assert) {
    assert.expect(2);

    await visit('/table');

    assert.deepEqual(
      findAll('.table-header-row-vc--view .table-header-cell__title').map(el => el.textContent.trim()),
      ['Date', 'Operating System', 'Unique Identifiers', 'Total Page Views', 'Total Page Views WoW'],
      'The headers for the table are as specified'
    );

    await reorder(
      'mouse',
      '.table-header-cell',
      '.table-header-cell:nth-child(2)', // move second column to first column position
      '.table-header-cell:nth-child(2)', // move new second column to second column position
      '.table-header-cell:nth-child(3)',
      '.table-header-cell:nth-child(4)',
      '.table-header-cell:nth-child(5)'
    );

    run(() =>
      assert.deepEqual(
        findAll('.table-header-row-vc--view .table-header-cell__title').map(el => el.textContent.trim()),
        ['Operating System', 'Date', 'Unique Identifiers', 'Total Page Views', 'Total Page Views WoW'],
        'The headers are reordered as specified by the reorder'
      )
    );
  });

  test('toggle table editing', async function(assert) {
    assert.expect(6);

    await visit('/table');
    assert.dom('.table-header-cell__input').isNotVisible('Table header edit field should not be visible');

    await click('.table-config__total-toggle-button .x-toggle-btn');
    assert.dom('.table-header-cell__input').isVisible('Table header edit field should be visible');

    assert
      .dom('.dateTime .number-format-dropdown__trigger')
      .isNotVisible('Datetime field should not have format dropdown trigger');

    assert
      .dom('.dimension .number-format-dropdown__trigger')
      .isNotVisible('Dimension field should not have format dropdown trigger');

    assert
      .dom('.metric .number-format-dropdown__trigger')
      .isVisible('Metric field should have format dropdown trigger');

    await click('.ember-basic-dropdown-trigger');
    assert.dom('.number-format-dropdown__container').isVisible('Table format dropdown should be visible');
  });

  test('edit table field', async function(assert) {
    assert.expect(2);

    await visit('/table');

    await click('.table-config__total-toggle-button .x-toggle-btn');
    await fillIn('.dateTime > .table-header-cell__input', 'test');
    await blur('.dateTime > .table-header-cell__input');
    await click('.table-config__total-toggle-button .x-toggle-btn');

    assert
      .dom('.table-header-row-vc--view .dateTime > .table-header-cell__title')
      .hasText('test', 'DateTime field should have custom name "test"');

    assert
      .dom('.table-header-row-vc--view .dateTime > .table-header-cell__title')
      .hasClass('table-header-cell__title--custom-name', 'DateTime field should have custom name class after editing');
  });

  test('edit table field - empty title', async function(assert) {
    assert.expect(2);

    await visit('/table');

    await click('.table-config__total-toggle-button .x-toggle-btn');
    await fillIn('.dateTime > .table-header-cell__input', '');
    await blur('.dateTime > .table-header-cell__input');
    await click('.table-config__total-toggle-button .x-toggle-btn');

    assert
      .dom('.table-header-row-vc--view .dateTime > .table-header-cell__title')
      .hasText('Date', 'DateTime field should have the default name "Date"');

    assert
      .dom('.table-header-row-vc--view .dateTime')
      .hasNoClass('custom-name', 'DateTime field should not have custom name class after removing title');
  });
});

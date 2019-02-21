import { click, fillIn, find, blur, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import config from 'ember-get-config';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';

module('Acceptance | table', function(hooks) {
  setupApplicationTest(hooks);

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
      find('.table-header-row-vc--view .table-header-cell__title')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Date', 'Operating System', 'Unique Identifiers', 'Total Page Views', 'Total Page Views WoW'],
      'The headers for the table are as specified'
    );

    await reorder(
      'mouse',
      '.table-header-cell',
      '.dimension:contains(Operating System)',
      '.dateTime',
      '.metric:contains(Unique Identifiers)',
      '.metric:contains(Total Page Views)',
      '.threshold:contains(Total Page Views WoW)'
    );

    assert.deepEqual(
      find('.table-header-row-vc--view .table-header-cell__title')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Operating System', 'Date', 'Unique Identifiers', 'Total Page Views', 'Total Page Views WoW'],
      'The headers are reordered as specified by the reorder'
    );
  });

  test('toggle table editing', async function(assert) {
    assert.expect(6);

    await visit('/table');
    assert.notOk(find('.table-header-cell__input').is(':visible'), 'Table header edit field should not be visible');

    await click('.table-config__total-toggle-button .x-toggle-btn');
    assert.ok(find('.table-header-cell__input').is(':visible'), 'Table header edit field should be visible');

    assert.notOk(
      find('.dateTime .number-format-dropdown__trigger').is(':visible'),
      'Datetime field should not have format dropdown trigger'
    );

    assert.notOk(
      find('.dimension .number-format-dropdown__trigger').is(':visible'),
      'Dimension field should not have format dropdown trigger'
    );

    assert.ok(
      find('.metric .number-format-dropdown__trigger').is(':visible'),
      'Metric field should have format dropdown trigger'
    );

    await clickTrigger();
    assert.ok($('.number-format-dropdown__container').is(':visible'), 'Table format dropdown should be visible');
  });

  test('edit table field', async function(assert) {
    assert.expect(2);

    await visit('/table');

    await click('.table-config__total-toggle-button .x-toggle-btn');
    await fillIn('.dateTime > .table-header-cell__input', 'test');
    await await blur('.dateTime > .table-header-cell__input');
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
    await fillIn('.dateTime > .table-header-cell__input', null);
    await await blur('.dateTime > .table-header-cell__input');
    await click('.table-config__total-toggle-button .x-toggle-btn');

    assert
      .dom('.table-header-row-vc--view .dateTime > .table-header-cell__title')
      .hasText('Date', 'DateTime field should have the default name "Date"');

    assert
      .dom('.table-header-row-vc--view .dateTime')
      .hasNoClass('custom-name', 'DateTime field should not have custom name class after removing title');
  });
});

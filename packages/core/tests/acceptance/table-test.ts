import { blur, click, fillIn, findAll, visit } from '@ember/test-helpers';
import { module, test, skip } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import config from 'ember-get-config';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { reorder } from 'ember-sortable/test-support/helpers';

module('Acceptance | table', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;
  });

  hooks.afterEach(function () {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
  });

  skip('visiting /table', async function (assert) {
    assert.expect(2);

    await visit('/table');

    assert.deepEqual(
      findAll('.table-header-row-vc--view .table-header-cell__title').map((el) => el.textContent?.trim()),
      [
        'Date Time (week)',
        'Operating System (id)',
        'Operating System (desc)',
        'Unique Identifiers',
        'Total Page Views',
        'Total Page Views WoW',
      ],
      'The headers for the table are as specified'
    );

    await reorder(
      'mouse',
      '.table-header-row-vc--view .table-header-cell',
      '.table-header-cell[data-name="os(field=desc)"] .table-header-cell__title',
      '.table-header-cell[data-name="os(field=id)"] .table-header-cell__title', // move second column to first column position
      '.table-header-cell[data-name="network.dateTime(grain=week)"] .table-header-cell__title', // move new second column to second column position
      '.table-header-cell[data-name="uniqueIdentifier"] .table-header-cell__title',
      '.table-header-cell[data-name="totalPageViews"] .table-header-cell__title',
      '.table-header-cell[data-name="totalPageViewsWoW"] .table-header-cell__title'
    );

    assert.deepEqual(
      findAll('.table-header-row-vc--view .table-header-cell__title').map((el) => el.textContent?.trim()),
      [
        'Operating System (desc)',
        'Operating System (id)',
        'Date Time (week)',
        'Unique Identifiers',
        'Total Page Views',
        'Total Page Views WoW',
      ],
      'The headers are reordered as specified by the reorder'
    );
  });

  test('toggle table editing', async function (assert) {
    assert.expect(6);

    await visit('/table');
    assert.dom('.table-header-cell__input').isNotVisible('Table header edit field should not be visible');

    await click('.table-config__total-toggle-button');
    assert.dom('.table-header-cell__input').isVisible('Table header edit field should be visible');

    assert
      .dom('.timeDimension .input .number-format-dropdown__trigger')
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

  test('edit table field', async function (assert) {
    assert.expect(2);

    await visit('/table');

    await click('.table-config__total-toggle-button');
    await fillIn('.timeDimension .input > .table-header-cell__input', 'test');
    await blur('.timeDimension .input > .table-header-cell__input');
    await click('.table-config__total-toggle-button');

    assert
      .dom('.table-header-row-vc--view .timeDimension > .table-header-cell__title')
      .hasText('test', 'DateTime field should have custom name "test"');

    assert
      .dom('.table-header-row-vc--view .timeDimension > .table-header-cell__title')
      .hasClass('table-header-cell__title--custom-name', 'DateTime field should have custom name class after editing');
  });

  test('edit table field - empty title', async function (assert) {
    assert.expect(2);

    await visit('/table');

    await click('.table-config__total-toggle-button');
    await fillIn('.timeDimension .input > .table-header-cell__input', '');
    await blur('.timeDimension .input > .table-header-cell__input');
    await click('.table-config__total-toggle-button');

    assert
      .dom('.table-header-row-vc--view .timeDimension > .table-header-cell__title')
      .hasText('Date Time (week)', 'DateTime field should have the default name "Date"');

    assert
      .dom('.table-header-row-vc--view .timeDimension')
      .hasNoClass('custom-name', 'DateTime field should not have custom name class after removing title');
  });
});

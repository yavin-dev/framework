import { test } from 'qunit';
import config from 'ember-get-config';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';

moduleForAcceptance('Acceptance | table', {
  beforeEach() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;
  },
  afterEach() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
  }
});

test('visiting /table', function(assert) {
  assert.expect(2);

  visit('/table');

  andThen(function() {
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
  });

  andThen(() => {
    return reorder(
      'mouse',
      '.table-header-cell',
      '.dimension:contains(Operating System)',
      '.dateTime',
      '.metric:contains(Unique Identifiers)',
      '.metric:contains(Total Page Views)',
      '.threshold:contains(Total Page Views WoW)'
    );
  });

  andThen(() => {
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
});

test('toggle table editing', function(assert) {
  assert.expect(6);

  visit('/table');
  andThen(function() {
    assert.notOk(find('.table-header-cell__input').is(':visible'), 'Table header edit field should not be visible');
  });

  click('.table-config__total-toggle-button .x-toggle-btn');
  andThen(function() {
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

    clickTrigger();
    andThen(function() {
      assert.ok($('.number-format-dropdown__container').is(':visible'), 'Table format dropdown should be visible');
    });
  });
});

test('edit table field', function(assert) {
  assert.expect(2);

  visit('/table');

  click('.table-config__total-toggle-button .x-toggle-btn');
  fillIn('.dateTime > .table-header-cell__input', 'test');
  triggerEvent('.dateTime > .table-header-cell__input', 'blur');
  click('.table-config__total-toggle-button .x-toggle-btn');

  andThen(function() {
    assert.equal(
      find('.table-header-row-vc--view .dateTime > .table-header-cell__title')
        .text()
        .trim(),
      'test',
      'DateTime field should have custom name "test"'
    );
  });

  andThen(function() {
    assert.ok(
      find('.table-header-row-vc--view .dateTime > .table-header-cell__title').hasClass(
        'table-header-cell__title--custom-name'
      ),
      'DateTime field should have custom name class after editing'
    );
  });
});

test('edit table field - empty title', function(assert) {
  assert.expect(2);

  visit('/table');

  click('.table-config__total-toggle-button .x-toggle-btn');
  fillIn('.dateTime > .table-header-cell__input', null);
  triggerEvent('.dateTime > .table-header-cell__input', 'blur');
  click('.table-config__total-toggle-button .x-toggle-btn');

  andThen(function() {
    assert.equal(
      find('.table-header-row-vc--view .dateTime > .table-header-cell__title')
        .text()
        .trim(),
      'Date',
      'DateTime field should have the default name "Date"'
    );
  });

  andThen(function() {
    assert.notOk(
      find('.table-header-row-vc--view .dateTime').hasClass('custom-name'),
      'DateTime field should not have custom name class after removing title'
    );
  });
});

import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';

moduleForAcceptance('Acceptance | table');

test('visiting /table', function(assert) {
  assert.expect(2);

  visit('/table');

  andThen(function() {
    assert.deepEqual(find('.table-header-cell__title').toArray().map(el => $(el).text().trim()),[
      'Date',
      'Operating System',
      'Unique Identifiers',
      'Total Page Views',
      'Total Page Views WoW'
    ], 'The headers for the table are as specified');
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
    assert.deepEqual(find('.table-header-cell__title').toArray().map(el => $(el).text().trim()),[
      'Operating System',
      'Date',
      'Unique Identifiers',
      'Total Page Views',
      'Total Page Views WoW'
    ], 'The headers are reordered as specified by the reorder');
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

    assert.notOk(find('.dateTime .number-format-dropdown__trigger').is(':visible'), 'Datetime field should not have format dropdown trigger');

    assert.notOk(find('.dimension .number-format-dropdown__trigger').is(':visible'), 'Dimension field should not have format dropdown trigger');

    assert.ok(find('.metric .number-format-dropdown__trigger').is(':visible'), 'Metric field should have format dropdown trigger');

    clickTrigger();
    andThen(function() {
      assert.ok($('.number-format-dropdown__container').is(':visible'), 'Table format dropdown should be visible');
    });
  });
});

test('edit table field', function(assert) {
  assert.expect(1);

  visit('/table');

  click('.table-config__total-toggle-button .x-toggle-btn');
  fillIn('.dateTime > .table-header-cell__input', 'test');
  click('.table-config__total-toggle-button .x-toggle-btn');

  andThen(function() {
    assert.ok(find('.dateTime').hasClass('custom-name'),
      'DateTime field should have custom name class after editing');
  });
});

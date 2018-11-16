import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | date filter');

test('date filter builder', function(assert) {
  assert.expect(2);

  visit('/reports/1/view');
  click('.grouped-list__group-header:contains(test)');
  click('.grouped-list__item:contains(User Signup Date)>.checkbox-selector__filter');

  andThen(function() {
    assert.ok(
      find('.filter-builder__operator:contains(Since)'),
      'The date dimension filter builder is used for a dimension with date values'
    );

    click('.filter-collection__remove');
    click('.grouped-list__item:contains(User Region)>.checkbox-selector__filter');

    andThen(function() {
      assert.ok(
        find('.filter-builder__operator:contains(Includes)'),
        'The normal dimension filter builder is used for a dimension with non-date values'
      );
    });
  });
});

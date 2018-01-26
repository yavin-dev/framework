import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';


moduleForAcceptance('Acceptance | print dashboard');

test('print dashboards index', function (assert) {
  assert.expect(1);
  visit('/print/dashboards/1');

  andThen(function () {
    assert.equal(currentURL(),
      '/print/dashboards/1/view',
      'Redirect to view sub route');
  });
});

test('print dashboards view', function (assert) {
  assert.expect(4);
  visit('/print/dashboards/1/view');

  andThen(function () {
    assert.equal(find('.page-title').text().trim(),
      'Tumblr Goals Dashboard',
      'Should show dashboard title');

    assert.notOk(find('.editable-label__icon').is(':visible'),
      'Title edit icon should not be visible');

    assert.notOk(find('.favorite-item').is(':visible'),
      'Favirote icon should not be visible');

    assert.notOk(find('.dashboard-actions').is(':visible'),
      'Dashboard actions should not be visible');
  });
});

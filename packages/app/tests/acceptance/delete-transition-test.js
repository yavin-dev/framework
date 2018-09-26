import { test } from 'qunit';
import moduleForAcceptance from 'navi-app/tests/helpers/module-for-acceptance';
import config from 'ember-get-config';

moduleForAcceptance('Acceptance | delete transition');

test('transitions to directory on asset deletion', function(assert) {
  assert.expect(2);

  visit('/reports/1');

  andThen(() => {
    assert.equal(currentURL(), '/reports/1/view', 'Start off viewing report 1');

    click('button:contains(Delete)');

    click('button:contains(Confirm)');

    andThen(function() {
      assert.equal(
        currentURL(),
        '/directory/my-data',
        'Transitions to directory after deleting an asset when directory is enabled'
      );
    });
  });
});

test('transitions to asset route on deletion', function(assert) {
  assert.expect(2);
  config.navi.FEATURES.enableDirectory = false;

  visit('/reports/1');

  andThen(() => {
    assert.equal(currentURL(), '/reports/1/view', 'Start off viewing report 1');

    click('button:contains(Delete)');

    click('button:contains(Confirm)');

    andThen(function() {
      assert.equal(
        currentURL(),
        '/reports',
        'Transitions to assets route after deleting an asset when directory is disabled'
      );

      config.navi.FEATURES.enableDirectory = true;
    });
  });
});

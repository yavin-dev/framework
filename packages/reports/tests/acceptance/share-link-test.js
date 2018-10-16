import { test } from 'qunit';
import { teardownModal } from '../helpers/teardown-modal';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | share link', {
  beforeEach() {
    return visit('/reports');
  },
  afterEach() {
    teardownModal();
    server.shutdown();
  }
});

test('report share link', function(assert) {
  let baseUrl = document.location.origin;
  // TriggerEvent does not work here, need to use jquery trigger mouseenter
  andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));

  click('.navi-collection__row:first-of-type .share .btn');

  andThen(() => {
    assert.equal(
      find('.modal-input-box')[0].value,
      `${baseUrl}/reports/1`,
      'The share link is built correctly by buildReportUrl'
    );
  });
});

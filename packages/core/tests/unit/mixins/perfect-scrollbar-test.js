import EmberObject from '@ember/object';
import PerfectScrollbarMixin from 'navi-core/mixins/perfect-scrollbar';
import { module, test } from 'qunit';

module('Unit | Mixin | perfect scrollbar');

// Replace this with your real tests.
test('it works', function(assert) {
  let PerfectScrollbarObject = EmberObject.extend(PerfectScrollbarMixin);
  let subject = PerfectScrollbarObject.create();
  assert.ok(subject);
});

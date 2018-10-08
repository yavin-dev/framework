import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import PerfectScrollbarMixin from 'navi-core/mixins/perfect-scrollbar';
import { module, test } from 'qunit';

module('Unit | Mixin | perfect scrollbar');

test('it works', function(assert) {
  let PerfectScrollbarObject = EmberObject.extend(PerfectScrollbarMixin);
  let subject = PerfectScrollbarObject.create();
  assert.ok(subject);
  run(() => subject.destroy());
});

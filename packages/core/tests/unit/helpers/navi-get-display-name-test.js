import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setOwner } from '@ember/application';

let helper;
module('Unit | Helper | navi get display name', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // Mock metadata service
    const MockMeta = {
      pageViews: { name: 'Page Views' }
    };

    const MockService = Service.extend({
      getById(type, id) {
        return MockMeta[id];
      }
    });

    this.owner.register('service:bard-metadata', MockService);

    helper = this.owner.lookup('helper:navi-get-display-name');
    helper = helper.create();
    setOwner(helper, this.owner);
  });

  test('display name is returned', function(assert) {
    assert.expect(3);

    assert.equal(helper.compute(['metric', 'pageViews']), 'Page Views', 'The helper returns the metric name');

    assert.equal(helper.compute(['metric', undefined]), undefined, 'Undefined is returned when id is not given');

    assert.throws(
      () => helper.compute(['metric', 'notAMetric']),
      /No metric found for id: notAMetric/,
      'An error is given when the id is not found'
    );
  });
});

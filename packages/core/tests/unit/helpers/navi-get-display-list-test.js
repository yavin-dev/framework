import Service from '@ember/service';
import { setOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let helper;
module('Unit | Helper | navi get display list', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // Mock metadata service
    const MockMeta = {
      pageViews: { longName: 'Page Views' },
      adClicks: { longName: 'Ad Clicks' },
      timeSpent: { longName: 'Time Spent' }
    };

    const MockService = Service.extend({
      getById(type, id) {
        return MockMeta[id];
      }
    });

    this.owner.register('service:bard-metadata', MockService);

    helper = this.owner.lookup('helper:navi-get-display-list');
    helper = helper.create();
    setOwner(helper, this.owner);
  });

  test('display name is returned', function(assert) {
    assert.expect(3);

    assert.equal(
      helper.compute(['metric', ['pageViews', 'adClicks', 'timeSpent']]),
      'Page Views, Ad Clicks, Time Spent',
      'The helper returns comma seperated list of longNames'
    );

    assert.equal(helper.compute(['metric', undefined]), undefined, 'Undefined is returned when ids are not given');

    assert.throws(
      () => helper.compute(['metric', ['pageViews', 'notAMetric', 'timeSpent']]),
      /No metric found for id: notAMetric/,
      'An error is given when the id is not found'
    );
  });
});

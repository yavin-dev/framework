import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

moduleFor('helper:navi-get-display-list', 'Unit | Helper | navi get display list');

test('display name is returned', function(assert) {
  assert.expect(3);

  // Mock metadata service
  const MockMeta = {
    pageViews: { longName: 'Page Views' },
    adClicks: { longName: 'Ad Clicks' },
    timeSpent: { longName: 'Time Spent' },
  };
  const MockService = Ember.Service.extend({
    getById(type, id) {
      return MockMeta[id];
    }
  });
  this.register('service:bard-metadata', MockService);

  let getDisplayList = this.subject();

  assert.equal(getDisplayList.compute(['metric', ['pageViews', 'adClicks', 'timeSpent']]),
    'Page Views, Ad Clicks, Time Spent',
    'The helper returns comma seperated list of longNames');

  assert.equal(getDisplayList.compute(['metric', undefined]),
    undefined,
    'Undefined is returned when ids are not given');

  assert.throws(() => getDisplayList.compute(['metric', ['pageViews', 'notAMetric', 'timeSpent']]),
    /No metric found for id: notAMetric/,
    'An error is given when the id is not found');
});

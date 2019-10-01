import { all } from 'rsvp';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Adapter | base json adapter', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('Coalescing find requests', function(assert) {
    assert.expect(1);
    this.server.urlPrefix = config.navi.appPersistence.uri;
    this.server.get('/mocks', (schema, request) => {
      assert.equal(
        request.queryParams['filter[mocks.id]'],
        '1,2,4',
        'Multiple find requests are grouped using filter query param'
      );

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];
    });

    return run(() => {
      all([
        this.owner.lookup('service:store').findRecord('mock', 1),
        this.owner.lookup('service:store').findRecord('mock', 2),
        this.owner.lookup('service:store').findRecord('mock', 4)
      ]).catch(() => 'Ignore empty response error');
    });
  });
});

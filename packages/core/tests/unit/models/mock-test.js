import { all } from 'rsvp';
import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';
import config from 'ember-get-config';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

moduleForModel('mock', 'Unit | Adapter | base json adapter', {
  needs: ['adapter:mock'],
  beforeEach() {
    setupMock();
  },
  afterEach() {
    teardownMock();
  }
});

test('Coalescing find requests', function(assert) {
  assert.expect(1);
  /*global server:true*/
  server.urlPrefix = config.navi.appPersistence.uri;
  server.get('/mocks', (schema, request) => {
    assert.equal(
      request.queryParams['filter[mocks.id]'],
      '1,2,4',
      'Multiple find requests are grouped using filter query param'
    );

    return [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];
  });

  return run(() => {
    all([
      this.store().findRecord('mock', 1),
      this.store().findRecord('mock', 2),
      this.store().findRecord('mock', 4)
    ]).catch(() => 'Ignore empty response error');
  });
});

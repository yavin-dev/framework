import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { moduleFor, test } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

moduleFor('service:model-compression', 'Unit | Service | model compression', {
  needs: [
    'model:report',
    'model:user',
    'model:delivery-rule',
    'model:dashboard',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/having',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'model:delivery-rule',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'model:line-chart',
    'model:table',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'service:bard-metadata',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'serializer:visualization',
    'serializer:report',
    'serializer:user',
    'serializer:delivery-rule',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:user',
    'service:bard-dimensions',
    'validator:recipients',
    'adapter:bard-metadata',
    'adapter:dimensions/bard'
  ],

  beforeEach() {
    this.server = startMirage();
    return getOwner(this)
      .lookup('service:bard-metadata')
      .loadMetadata();
  },

  afterEach() {
    this.server.shutdown();
  }
});

test('compress and decompress', function(assert) {
  assert.expect(5);

  let service = this.subject();

  return run(async function() {
    let store = service.get('store'),
      user = store.createRecord('user', { id: 'midna' }),
      request = store.createFragment('bard-request/request'),
      report = store.createRecord('report', {
        id: '1234',
        title: 'Hello World',
        author: user,
        request
      }),
      compressedString = await service.compress(report);

    assert.equal(
      compressedString,
      encodeURIComponent(compressedString),
      'The model compresses to a string safe for use in a URL'
    );

    assert.ok(
      compressedString.length < 1000,
      'The model compresses to a string significantly shorter than the URL limit'
    );

    let decompressedModel = await service.decompress(compressedString);
    assert.deepEqual(
      decompressedModel.getProperties('id', 'title'),
      { id: '1234', title: 'Hello World' },
      'The decompressed model contains the same properties as the original'
    );

    let decompressedUser = await decompressedModel.get('author');
    assert.equal(decompressedUser, user, 'The decompressed model maintains the original relationships');

    assert.equal(decompressedModel.get('request'), request, 'The decompressed model maintains the original fragments');
  });
});

test('id is required', function(assert) {
  assert.expect(1);

  run(() => {
    let service = this.subject(),
      store = service.get('store'),
      report = store.createRecord('report', { title: 'Hello World' });

    assert.throws(
      () => service.compress(report),
      /A model given to `compress` must have an id/,
      'An error is thrown if the model does not have an id set'
    );
  });
});

test('_pushPayload', function(assert) {
  assert.expect(3);

  run(() => {
    let service = this.subject(),
      store = service.get('store'),
      report = store.createRecord('report', { title: 'Hello World' }),
      jsonPayload = report.serialize();

    jsonPayload.data.id = 1234;

    assert.equal(store.peekRecord('report', 1234), null, 'Model from payload is not initally in the store');

    let model = service._pushPayload(jsonPayload);
    assert.equal(model.get('title'), 'Hello World', '_pushPayload returns a model with attributes from payload');

    assert.ok(store.peekRecord('report', 1234), 'Model from payload exists in store after _pushPayload');
  });
});

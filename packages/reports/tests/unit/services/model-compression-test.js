import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

module('Unit | Service | model compression', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.server = startMirage();
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('compress and decompress', function(assert) {
    assert.expect(5);

    let service = this.owner.lookup('service:model-compression');

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

      assert.equal(
        decompressedModel.get('request'),
        request,
        'The decompressed model maintains the original fragments'
      );
    });
  });

  test('id is required', function(assert) {
    assert.expect(1);

    run(() => {
      let service = this.owner.lookup('service:model-compression'),
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
      let service = this.owner.lookup('service:model-compression'),
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
});

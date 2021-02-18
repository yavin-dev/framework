import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

let Service;

module('Unit | Service | compression', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Service = this.owner.lookup('service:compression');
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('compress and decompress', async function (assert) {
    assert.expect(3);

    const object = { foo: 'bar' };
    const compressedString = await Service.compress(object);

    assert.equal(
      compressedString,
      encodeURIComponent(compressedString),
      'The object compressed to a string safe for use in a URL without requiring an id'
    );

    assert.ok(
      compressedString.length < 1000,
      'The object compresses to a string significantly shorter than the URL limit'
    );

    const decompressedObject = await Service.decompress(compressedString);

    assert.deepEqual(decompressedObject, { foo: 'bar' }, 'Decompressing the string returns the original object');
  });

  test('compressModel and decompressModel', async function (assert) {
    assert.expect(5);

    const store = Service.get('store');
    const user = store.createRecord('user', { id: 'midna' });
    const request = store.createFragment('bard-request-v2/request');
    const report = store.createRecord('report', {
      id: '1234',
      title: 'Hello World',
      author: user,
      request,
    });
    const compressedString = await Service.compressModel(report);

    assert.equal(
      compressedString,
      encodeURIComponent(compressedString),
      'The model compresses to a string safe for use in a URL'
    );

    assert.ok(
      compressedString.length < 1000,
      'The model compresses to a string significantly shorter than the URL limit'
    );

    const decompressedModel = await Service.decompressModel(compressedString);
    assert.deepEqual(
      decompressedModel.getProperties('id', 'title'),
      { id: '1234', title: 'Hello World' },
      'The decompressed model contains the same properties as the original'
    );

    const decompressedUser = await decompressedModel.get('author');
    assert.equal(decompressedUser, user, 'The decompressed model maintains the original relationships');

    assert.equal(decompressedModel.get('request'), request, 'The decompressed model maintains the original fragments');
  });

  test('compressModel: id is required', function (assert) {
    assert.expect(1);
    const store = Service.get('store');
    const report = store.createRecord('report', { title: 'Hello World' });

    assert.throws(
      () => Service.compressModel(report),
      /A model given to `compress` must have an id/,
      'An error is thrown if the model does not have an id set'
    );
  });

  test('_pushPayload', function (assert) {
    assert.expect(3);

    const service = this.owner.lookup('service:compression');
    const store = service.get('store');
    const report = store.createRecord('report', { title: 'Hello World' });
    const jsonPayload = report.serialize();

    jsonPayload.data.id = 1234;

    assert.equal(store.peekRecord('report', 1234), null, 'Model from payload is not initally in the store');

    const model = service._pushPayload(jsonPayload);
    assert.equal(model.get('title'), 'Hello World', '_pushPayload returns a model with attributes from payload');

    assert.ok(store.peekRecord('report', 1234), 'Model from payload exists in store after _pushPayload');
  });
});

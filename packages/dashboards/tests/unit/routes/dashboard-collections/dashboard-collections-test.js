import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Route | dashboard collections/collection', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('model', async function (assert) {
    assert.expect(4);

    const params = { collection_id: 1 };
    const route = this.owner.lookup('route:dashboard-collections/collection');
    const modelPromise = route.model(params);

    assert.ok(modelPromise.then, 'Route returns a promise in the model hook');

    const model = await modelPromise;
    assert.equal(model.id, params.collection_id, 'The requested collection is retrieved');

    assert.equal(model.title, `Collection ${params.collection_id}`, 'The requested collection is retrieved');

    const dashboards = await model.get('dashboards');
    assert.equal(dashboards.length, 2, 'The requested collection is retrieved with the two dashboards');
  });
});

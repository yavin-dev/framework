import { Client } from '@yavin/client';
import { Injector } from '@yavin/client/models/native-with-create';
import { module, test } from 'qunit';

module('Unit | Client', function () {
  test('servicePlugins', function (assert) {
    assert.expect(10);

    let callCount: Record<string, number> = {};
    const returnMock = (mock: string) => {
      callCount[mock] = 0;
      return (injector: Injector) => {
        callCount[mock] = callCount[mock] + 1;
        assert.strictEqual(typeof injector.lookup, 'function', 'injector is passed in to create function');
        return mock;
      };
    };
    const client = new Client(
      //@ts-expect-error - empty config
      {},
      {
        servicePlugins: {
          metadata: returnMock('metadata'),
          facts: returnMock('facts'),
          dimensions: returnMock('dimensions'),
        },
      }
    );

    assert.deepEqual(callCount, { facts: 0, metadata: 0, dimensions: 0 }, 'No services are created until looked up');

    const first = client.facts;
    assert.equal(first, 'facts', 'It returns the custom facts service plugin');
    assert.equal(client.metadata, 'metadata', 'It returns the custom metadata service plugin');
    assert.equal(client.dimensions, 'dimensions', 'It returns the custom dimensions service plugin');

    assert.deepEqual(callCount, { facts: 1, metadata: 1, dimensions: 1 }, 'All services have been created');
    const second = client.facts;
    assert.strictEqual(first, second, 'The same instance is returned on subsequent lookups');
    assert.deepEqual(callCount, { facts: 1, metadata: 1, dimensions: 1 }, 'The fact service is not created again');
  });
});

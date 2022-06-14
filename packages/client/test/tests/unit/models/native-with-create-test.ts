import { module, test } from 'qunit';
import NativeWithCreate, { ClientService, Injector } from '@yavin/client/models/native-with-create';
import { Mock } from '../../../tests/helpers/injector';

module('Unit | Model | native with create', function () {
  test('it exists', function (assert) {
    const instance = new NativeWithCreate(Mock().build(), {});
    assert.ok(instance, 'Factory can create classes');
  });

  test('it injects services', function (assert) {
    class Custom extends NativeWithCreate {
      @ClientService('navi-dimension') dims: unknown;
    }
    const mockService = {};
    const injector: Injector = {
      //@ts-expect-error - mock injector
      lookup(type, name) {
        assert.equal(type, 'service', 'looks up service');
        assert.equal(name, 'navi-dimension', 'name is passed to lookup');
        return mockService;
      },
    };
    const instance = new Custom(injector, {});
    assert.strictEqual(instance.dims, mockService, 'Services are injected');
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NativeWithCreate, { ClientService } from '@yavin/client/models/native-with-create';

module('Unit | Model | native with create', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const instance = new NativeWithCreate(this.owner.lookup('service:client-injector'), {});
    assert.ok(instance, 'Factory can create classes');
  });

  test('it injects services', function (assert) {
    class Custom extends NativeWithCreate {
      @ClientService('navi-dimension') dims: unknown;
    }
    const instance = new Custom(this.owner.lookup('service:client-injector'), {});
    assert.deepEqual(instance.dims, this.owner.lookup('service:navi-dimension'), 'Services are injected');
  });
});

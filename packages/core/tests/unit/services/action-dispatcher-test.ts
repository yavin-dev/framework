import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { getContext } from '@ember/test-helpers';
import { TestContext } from 'ember-test-helpers';
import { assert } from '@ember/debug';
import ActionDispatcher from 'navi-core/services/action-dispatcher';
import ActionConsumer from 'navi-core/consumers/action-consumer';

function registerDispatcher(consumers: string[]): { service: ActionDispatcher; destroy: Function } {
  const owner = (getContext() as TestContext).owner;
  class TestService extends ActionDispatcher {
    get consumers() {
      return consumers;
    }
  }

  const newService = 'service:test-service';
  owner.register(newService, TestService);
  const service = owner.lookup(newService);
  return { service, destroy: () => owner.unregister(newService) };
}
type Consumer = { name: string; actions: object };

function createDispatcher(...consumers: Consumer[]) {
  const owner = (getContext() as TestContext).owner;
  const consumerRegistries = consumers.map(c => {
    const registry = `consumer:${c.name}`;
    owner.register(registry, ActionConsumer.extend({ actions: c.actions }));
    return registry;
  });

  let response = registerDispatcher(consumers.map(c => c.name));

  return {
    service: response.service,
    destroy: () => {
      consumerRegistries.forEach(registry => owner.unregister(registry));
      response.destroy();
    }
  };
}

module('Unit | Service | action-dispatcher', function(hooks) {
  setupTest(hooks);

  test('dispatch calls the correct action', function(assert) {
    assert.expect(2);

    const foo = {
      name: 'foo',
      actions: {
        actionOne(arg1: number, arg2: number) {
          assert.equal(arg1, 1, 'dispatch call the correct action');
          assert.equal(arg2, 42, 'dispatch can send multiple params');
        },
        actionTwo() {
          assert.notOk(true, 'this action should not be called');
        }
      }
    };

    const bar = {
      name: 'bar',
      actions: {
        actionThree() {
          assert.notOk(true, 'this action should not be called');
        }
      }
    };

    let testService = createDispatcher(foo, bar);

    testService.service.dispatch('actionOne', 1, 42);
    testService.destroy();
  });

  test('dispatch can call an action on multiple consumers', function(assert) {
    assert.expect(5);

    const foo = {
      name: 'foo',
      actions: {
        actionOne(arg1: number) {
          assert.step('dispatch sent an action to foo consumer');
          assert.equal(arg1, 1, 'dispatch sent the correct argument to the action');
        }
      }
    };

    const bar = {
      name: 'bar',
      actions: {
        actionOne(arg1: number) {
          assert.step('dispatch sent an action to bar consumer');
          assert.equal(arg1, 1, 'dispatch sent the correct argument to the action');
        }
      }
    };

    let testService = createDispatcher(foo, bar);

    testService.service.dispatch('actionOne', 1);

    assert.verifySteps(
      ['dispatch sent an action to foo consumer', 'dispatch sent an action to bar consumer'],
      'dispatch can a send a single action to multiple consumers'
    );
    testService.destroy();
  });
});

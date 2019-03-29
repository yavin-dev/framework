import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import consumer from 'navi-core/consumers/action-consumer';

let Container, ServiceFactory;

module('Unit | Service | action-dispatcher', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Container = this.owner;
    ServiceFactory = Container.factoryFor('service:action-dispatcher');
  });

  test('dispatch calls the correct action', function(assert) {
    assert.expect(2);

    createConsumer('foo', {
      actionOne(arg1, arg2) {
        assert.equal(arg1, 1, 'dispatch call the correct action');

        assert.equal(arg2, 42, 'dispatch can send multiple params');
      },

      actionTwo() {
        assert.notOk(true, 'this action should not be called');
      }
    });

    createConsumer('bar', {
      actionThree() {
        assert.notOk(true, 'this action should not be called');
      }
    });

    let testService = ServiceFactory.create({
      consumers: ['foo', 'bar']
    });

    testService.dispatch('actionOne', 1, 42);
  });

  test('dispatch can call an action on multiple consumers', function(assert) {
    assert.expect(5);

    createConsumer('foo', {
      actionOne(arg1) {
        assert.step('dispatch sent an action to foo consumer');
        assert.equal(arg1, 1, 'dispatch sent the correct argument to the action');
      }
    });

    createConsumer('bar', {
      actionOne(arg1) {
        assert.step('dispatch sent an action to bar consumer');
        assert.equal(arg1, 1, 'dispatch sent the correct argument to the action');
      }
    });

    let testService = ServiceFactory.create({
      consumers: ['foo', 'bar']
    });

    testService.dispatch('actionOne', 1);

    assert.verifySteps(
      ['dispatch sent an action to foo consumer', 'dispatch sent an action to bar consumer'],
      'dispatch can a send a single action to multiple consumers'
    );
  });

  function createConsumer(name, actions) {
    Container.register(`consumer:${name}`, consumer.extend({ actions }));
  }
});

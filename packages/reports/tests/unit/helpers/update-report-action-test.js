import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { UpdateReportActions } from 'navi-reports/services/update-report-action-dispatcher';
import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';

let Container;

module('Unit | Helper | update report action', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Container = this.owner;
  });

  test('update-report-action helper calls the correct route action', function(assert) {
    assert.expect(4);

    createMockRoute((actionType, helperParam, invocationParam) => {
      assert.ok(true, 'update-report-action called the correct route-action');

      assert.equal(
        actionType,
        UpdateReportActions.UPDATE_TABLE,
        'update-report-action called with the correct report action name'
      );

      assert.equal(helperParam, 'helperParam', 'update-report-action called with the correct helperParam');

      assert.equal(invocationParam, 'invocationParam', 'update-report-action called with the correct invocationParam');
    });

    this.owner.lookup('helper:update-report-action').compute(['UPDATE_TABLE', 'helperParam'])('invocationParam');
  });

  test('update-report-action errors', function(assert) {
    assert.expect(1);

    assert.throws(
      () => this.owner.lookup('helper:update-report-action').compute(['BAD NAME']),
      'report action throws error if report action cannot be found'
    );
  });

  function createMockRoute(onUpdateReport) {
    Container.register(
      'router:main',
      {
        router: {
          currentHandlerInfos: [
            {
              handler: Route.extend({
                actions: { onUpdateReport }
              }).create()
            }
          ]
        }
      },
      { instantiate: false }
    );
  }
});

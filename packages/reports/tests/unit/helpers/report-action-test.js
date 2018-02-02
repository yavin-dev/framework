import { moduleFor, test } from 'ember-qunit';
import { ReportActions } from 'navi-reports/services/report-action-dispatcher';
import Ember from 'ember';

const { getOwner } = Ember;

let Container;
moduleFor('helper:report-action', 'Unit | Helper | report action', {
  needs: [
    'helper:route-action',
    'service:report-action-dispatcher'
  ],

  beforeEach() {
    Container = getOwner(this);
  }
});

test('report-action helper calls the correct route action', function(assert) {
  assert.expect(4);

  createMockRoute((actionType, helperParam, invocationParam) => {
    assert.step('report-action called the correct route-action');

    assert.equal(actionType,
      ReportActions.UPDATE_TABLE,
      'report-action called with the correct report action name');

    assert.equal(helperParam,
      'helperParam',
      'report-action called with the correct helperParam');

    assert.equal(invocationParam,
      'invocationParam',
      'report-action called with the correct invocationParam');
  });

  this.subject().compute(['UPDATE_TABLE', 'helperParam'])('invocationParam');
});

test('report-action errors', function(assert) {
  assert.expect(1);

  assert.throws(() => this.subject().compute(['BAD NAME']),
    'report action throws error if report action cannot be found');
});

function createMockRoute(onUpdateReport) {
  Container.register('router:main', {
    router: {
      currentHandlerInfos: [{
        handler: Ember.Route.extend({
          actions: { onUpdateReport }
        }).create()
      }]
    }
  }, { instantiate: false });
}

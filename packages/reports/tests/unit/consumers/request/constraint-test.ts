import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import Route from '@ember/routing/route';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import ConstraintConsumer from 'navi-reports/consumers/request/constraint';
import RequestConstrainer from 'navi-reports/services/request-constrainer';
import ReportModel from 'navi-core/models/report';

let consumer: ConstraintConsumer;

const MockConstrainer: Partial<RequestConstrainer> = {};

interface TestContext extends Context {
  metadataService: NaviMetadataService;
}

module('Unit | Consumer | request constraint', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    consumer = this.owner
      .factoryFor('consumer:request/constraint')
      .create({ requestConstrainer: MockConstrainer }) as ConstraintConsumer;
    this.metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await this.metadataService.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('DID_UPDATE_TABLE', function (assert) {
    assert.expect(1);
    const mockRoute = ({ modelFor: () => ({ request: 'fakeRequest' }) } as unknown) as Route;

    MockConstrainer.constrain = (route) => {
      assert.deepEqual(route, mockRoute, 'The constrainer service is called after a table update is done');

      return route.modelFor(route.routeName) as ReportModel;
    };

    consumer.send(RequestActions.DID_UPDATE_TABLE, mockRoute);
  });
});

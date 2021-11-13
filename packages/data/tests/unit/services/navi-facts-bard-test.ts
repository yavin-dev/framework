import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { taskFor } from 'ember-concurrency-ts';
import type { Server } from 'miragejs';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';
import type { TestContext as Context } from 'ember-test-helpers';
import type NaviFactsService from 'navi-data/services/navi-facts';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { Grain } from 'navi-data/utils/date';

interface TestContext extends Context {
  service: NaviFactsService;
  server: Server;
}

const EmptyRequest: RequestV2 = {
  table: 'table1',
  columns: [],
  filters: [],
  sorts: [],
  limit: null,
  requestVersion: '2.0',
  dataSource: 'bardOne',
};

const allWithFilterGrain = (grain: Grain, values: string[]): RequestV2 => ({
  ...EmptyRequest,
  filters: [
    {
      type: 'timeDimension',
      field: '.dateTime',
      parameters: { grain },
      operator: 'bet',
      values,
    },
  ],
});

module('Unit | Service | Navi Facts - Bard', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.service = this.owner.lookup('service:navi-facts');
    const metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await metadataService.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('fetch and catch error', async function (this: TestContext, assert) {
    const request = allWithFilterGrain('day', ['P1D', 'current']);

    await taskFor(this.service.fetch)
      .perform(request, { dataSourceName: request.dataSource })
      .catch((response) => {
        assert.ok(true, 'A request error falls into the promise catch block');
        assert.equal(
          response.details[0],
          "Invalid interval for 'all' grain.",
          'Error is thrown for using macros with "all" grain'
        );
      });

    const request2 = allWithFilterGrain('day', ['value1', 'value1']);
    request2.columns = [
      {
        type: 'timeDimension',
        field: '.dateTime',
        parameters: { grain: 'day' },
      },
    ];

    await taskFor(this.service.fetch)
      .perform(request2, { dataSourceName: request2.dataSource })
      .catch((response) => {
        assert.equal(
          response.details[0],
          'Date time cannot have zero length interval. value1/value1.',
          'Error is thrown for using macros with "all" grain'
        );
      });
  });
});

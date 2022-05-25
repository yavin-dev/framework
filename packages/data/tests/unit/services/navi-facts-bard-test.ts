import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { taskFor } from 'ember-concurrency-ts';
import type { Server } from 'miragejs';
import type { RequestV2 } from '@yavin/client/request';
import type { TestContext as Context } from 'ember-test-helpers';
import type NaviFactsService from 'navi-data/services/navi-facts';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { Grain } from '@yavin/client/utils/date';

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
    assert.expect(4);

    const request = allWithFilterGrain('day', ['currentFoo', 'nextDay']);
    await taskFor(this.service.fetch)
      .perform(request, { dataSourceName: request.dataSource })
      .catch((response) => {
        assert.equal(
          response.details[0],
          "Invalid interval for 'all' grain. currentFoo/nextDay.",
          'Error is thrown for using an invalid macro as interval start with "all" grain'
        );
      });

    const request2 = allWithFilterGrain('day', ['currentDay', 'nextFoo']);
    await taskFor(this.service.fetch)
      .perform(request2, { dataSourceName: request2.dataSource })
      .catch((response) => {
        assert.equal(
          response.details[0],
          "Invalid interval for 'all' grain. currentDay/nextFoo.",
          'Error is thrown for using an invalid macro as interval end with "all" grain'
        );
      });

    const request3 = allWithFilterGrain('day', ['2021-04-31', '2021-05-03']);
    await taskFor(this.service.fetch)
      .perform(request3, { dataSourceName: request3.dataSource })
      .catch((response) => {
        assert.equal(
          response.details[0],
          "Invalid interval for 'all' grain. 2021-04-31/2021-05-04T00:00:00.000.",
          'Error is thrown for using invalid dates with "all" grain'
        );
      });

    const request4 = allWithFilterGrain('day', ['value1', 'value1']);
    request4.columns = [
      {
        type: 'timeDimension',
        field: '.dateTime',
        parameters: { grain: 'day' },
      },
    ];

    await taskFor(this.service.fetch)
      .perform(request4, { dataSourceName: request4.dataSource })
      .catch((response) => {
        assert.equal(
          response.details[0],
          'Date time cannot have zero length interval. value1/value1.',
          'Error is thrown for zero length interval'
        );
      });
  });
});

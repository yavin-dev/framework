import { module, test } from 'qunit';
import FiliFactAdapter from '@yavin/client/plugins/fili/adapters/facts';
import type { RequestV2 } from '@yavin/client/request';
import { Mock } from '../../../../helpers/injector';
import setupServer, { WithServer } from '../../../../helpers/server';
import type MetadataService from '@yavin/client/services/interfaces/metadata';
import { ClientConfig } from '@yavin/client/config/datasources';
import { rest } from 'msw';

let Adapter: FiliFactAdapter;

module('Unit | Plugins | Fili | Adapters | facts', function (hooks) {
  setupServer(hooks);

  hooks.beforeEach(function () {
    Adapter = new FiliFactAdapter(
      Mock()
        .decorator({ applyGlobalDecorators: (request) => request })
        .meta({ getById: () => undefined } as unknown as MetadataService)
        .config(
          //@ts-expect-error - partial config
          new ClientConfig({ dataSources: [{ name: 'bardOne', type: 'fili', uri: 'https://mock-fili.yavin.dev' }] })
        )
        .build()
    );
  });

  test('http request mocking', async function (this: WithServer, assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [
        { type: 'timeDimension', field: 'tableName.dateTime', parameters: { grain: 'day' } },
        { type: 'metric', field: 'metricName', parameters: { param: 'value' } },
      ],
      filters: [
        {
          type: 'timeDimension',
          field: 'tableName.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['current', 'next'],
        },
      ],
      sorts: [],
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0',
    };

    const host = Adapter.config.dataSources[0].uri;
    this.server.use(
      rest.get(`${host}/*`, (_req, res, ctx) => {
        return res(
          ctx.json({
            rows: [{ mock: true }],
          })
        );
      })
    );
    const response = await Adapter.fetchDataForRequest(request, { dataSourceName: 'bardOne' });
    assert.deepEqual(
      { rows: [{ mock: true }] },
      response,
      'Returns empty rows but preserves meta when there is no request'
    );
  });
});

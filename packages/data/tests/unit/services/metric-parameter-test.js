import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import Pretender from 'pretender';
import metadataRoutes from '../../helpers/metadata-routes';

const HOST = config.navi.dataSources[0].uri;

let MetadataService,
  Rows = A([
    {
      id: '-1',
      description: 'NULL'
    },
    {
      id: '-2',
      description: 'UNKNOWN'
    },
    {
      id: '1',
      description: 'Value One'
    },
    {
      id: '2',
      description: 'Value Two'
    }
  ]),
  OtherRows = A([
    {
      id: '-1',
      description: 'NULL'
    },
    {
      id: '-2',
      description: 'UNKNOWN'
    },
    {
      id: '1',
      description: 'One'
    },
    {
      id: '2',
      description: 'Two'
    }
  ]),
  Server;

module('Unit | Service | metric parameter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    MetadataService = this.owner.lookup('service:bard-metadata');

    //setup Pretender
    Server = new Pretender(function() {
      this.get(`${HOST}/v1/dimensions/dimensionOne/values/`, () => [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          rows: Rows
        })
      ]);
      this.get(`${HOST}/v1/dimensions/dimensionThree/values/`, () => {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            rows: OtherRows
          })
        ];
      });
    });

    Server.map(metadataRoutes);

    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    //shutdown pretender
    Server.shutdown();
  });

  test('fetchAllValues - dimension parameter', function(assert) {
    assert.expect(1);

    let service = this.owner.lookup('service:metric-parameter'),
      parameter = {
        type: 'dimension',
        dimensionName: 'dimensionOne'
      };

    return service.fetchAllValues(parameter).then(res => {
      assert.deepEqual(res.content.mapBy('id'), Rows.mapBy('id'), 'Fetches all the values for the specified parameter');
    });
  });

  test('fetchAllValues - non-dimension parameter', function(assert) {
    assert.expect(1);

    let service = this.owner.lookup('service:metric-parameter'),
      invalidParameter = {
        type: 'invalidType',
        dimensionName: 'dimensionOne'
      };

    assert.throws(
      () => service.fetchAllValues(invalidParameter),
      /Fetching values of type: 'invalidType' is not supported/,
      'fetch all values throws exception for an invalid parameter'
    );
  });

  test('fetchAllValues - enum type', async function(assert) {
    let service = this.owner.lookup('service:metric-parameter'),
      parameter = {
        type: 'enum',
        values: [{ id: 1, description: 'One' }, { id: 2, description: 'Two' }]
      };

    const results = await service.fetchAllValues(parameter);

    assert.deepEqual(
      [{ id: 1, description: 'One' }, { id: 2, description: 'Two' }],
      results,
      'Enum paramter type returns correct values from meta.'
    );
  });

  test('fetchAllParams', async function(assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:metric-parameter'),
      metricMeta = {
        parameters: [
          {
            type: 'dimension',
            dimensionName: 'dimensionOne'
          },
          {
            type: 'dimension',
            dimensionName: 'dimensionThree'
          }
        ]
      };

    const results = Object.values(await service.fetchAllParams(metricMeta)).reduce((acc, curr) => {
      const key = curr.param;
      const obj = { id: curr.id, description: curr.description };
      if (acc[key]) {
        acc[key].pushObject(obj);
      } else {
        acc[key] = A([obj]);
      }
      return acc;
    }, {});

    assert.deepEqual(
      results,
      {
        0: Rows,
        1: OtherRows
      },
      'All Values for each metric parameter is returned'
    );

    const emptyResults = await service.fetchAllParams({});
    assert.deepEqual(emptyResults, {}, 'A metric metadata object with no parameters returns no values');
  });
});

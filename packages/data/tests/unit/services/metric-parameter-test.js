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
      name: 'NULL'
    },
    {
      id: '-2',
      name: 'UNKNOWN'
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
      [{ id: 1, description: 'One', name: 'One' }, { id: 2, description: 'Two', name: 'Two' }],
      results,
      'Enum paramter type returns correct values from meta.'
    );
  });
});

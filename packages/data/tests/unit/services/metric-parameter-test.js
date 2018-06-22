import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { getOwner } from '@ember/application';
import config from 'ember-get-config';
import Pretender from 'pretender';
import metadataRoutes from '../../helpers/metadata-routes';

const HOST = config.navi.dataSources[0].uri;

let MetadataService,
  Rows = Ember.A([
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

moduleFor('service:metric-parameter', 'Unit | Service | metric parameter', {
  needs: [
    'adapter:bard-metadata',
    'adapter:dimensions/bard',
    'adapter:dimensions/keg',
    'model:bard-dimension',
    'model:bard-dimension-array',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/table',
    'model:metadata/time-grain',
    'serializer:bard-metadata',
    'serializer:dimensions/bard',
    'service:ajax',
    'service:bard-metadata',
    'service:bard-dimensions',
    'service:keg',
    'service:request-decorator'
  ],
  beforeEach() {
    MetadataService = getOwner(this).lookup('service:bard-metadata');

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
  },

  afterEach() {
    //shutdown pretender
    Server.shutdown();
  }
});

test('fetchAllValues - dimension parameter', function(assert) {
  assert.expect(1);

  let service = this.subject(),
    parameter = {
      type: 'dimension',
      dimensionName: 'dimensionOne'
    };

  return service.fetchAllValues(parameter).then(res => {
    assert.deepEqual(
      res.content.mapBy('id'),
      Rows.mapBy('id'),
      'Fetches all the values for the specified parameter'
    );
  });
});

test('fetchAllValues - non-dimension parameter', function(assert) {
  assert.expect(1);

  let service = this.subject(),
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

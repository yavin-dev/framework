import EmberObject from '@ember/object';
import { assign } from '@ember/polyfills';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import metadataRoutes from '../../../helpers/metadata-routes';
import Pretender from 'pretender';

const Response1 = {
  rows: [
    { id: 1, description: 'foo', meta: 'ember' },
    { id: 2, description: 'bar', meta: 'bard' },
    { id: 3, description: 'gar', meta: 'navi' }
  ]
};

const MetaObj = {
  meta: {
    pagination: {
      rowsPerPage: 3,
      numberOfResults: 3,
      currentPage: 1
    }
  }
};

const Response2 = assign(MetaObj, Response1);

const Record1 = { id: 1, description: 'foo', meta: 'ember' },
  Record2 = { id: 2, description: 'bar', meta: 'bard' },
  Record3 = { id: 3, description: 'gar', meta: 'navi' },
  Records = [Record1, Record2, Record3];

let Adapter, Keg, Server;

module('Unit | Adapters | Dimensions | Keg', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('model:dimension/dimensionOne', EmberObject.extend({ name: 'dimensionOne' }));

    Adapter = this.owner.lookup('adapter:dimensions/keg');

    Keg = Adapter.get('keg');
    Keg.pushMany('dimension/dimensionOne', Records);

    //Load metadata
    Server = new Pretender(metadataRoutes);
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  hooks.afterEach(function() {
    Server.shutdown();
  });

  test('_buildResponse', function(assert) {
    assert.expect(2);

    assert.deepEqual(
      Adapter._buildResponse(Records),
      Response1,
      '_buildResponse correctly built the response for the provided records'
    );

    assert.deepEqual(
      Adapter._buildResponse(Records, { page: 1, perPage: 3 }),
      Response2,
      '_buildResponse correctly built the response with pagination options for the provided records'
    );
  });

  test('all', function(assert) {
    assert.expect(1);

    return Adapter.all('dimensionOne').then(result => {
      assert.deepEqual(
        result.rows.mapBy('id'),
        [1, 2, 3],
        'all() contains the expected response object for Test dimension without any filters'
      );
    });
  });

  test('find', function(assert) {
    assert.expect(2);

    assert.throws(
      () => {
        Adapter.find('dimensionOne', { operator: 'contains' });
      },
      /Only 'in' operation is currently supported in Keg/,
      'throws error when doing a contains search, which is not supported yet'
    );

    return Adapter.find('dimensionOne', {
      field: 'description',
      values: 'bar,gar'
    }).then(result => {
      assert.deepEqual(
        result.rows.mapBy('id'),
        [2, 3],
        'find() returns expected response using navi-data query object interface.'
      );
    });
  });

  test('findById', function(assert) {
    assert.expect(1);

    return Adapter.findById('dimensionOne', '1').then(result => {
      assert.deepEqual(
        result.get('id'),
        1,
        'findById() returns the expected response object for Test dimension, identifierField and query'
      );
    });
  });

  test('pushMany', function(assert) {
    assert.expect(2);
    Adapter.pushMany('dimensionOne', [{ id: 22, foo: 'bar' }, { id: 44, foo: 'baz' }]);

    let { foo: bar } = Keg.getById('dimension/dimensionOne', 22);
    assert.deepEqual(bar, 'bar', 'pushMany stores records into the keg');

    let { foo: baz } = Keg.getById('dimension/dimensionOne', 44);
    assert.deepEqual(baz, 'baz', 'pushMany stores records into the keg');
  });
});

import { run } from '@ember/runloop';
import { A } from '@ember/array';
import { get, set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import Pretender from 'pretender';
import config from 'ember-get-config';
import metadataRoutes from '../../helpers/metadata-routes';

let Service, Server, MetadataService;

// Regular expression corresponding to query parameter syntax (ex: "dimensionOne|id-in[v1,v2]")
const QUERY_PARAM_REGEX = /^\w+\|([a-zA-Z]+)-(\w+)\[((?:\w+,)*\w+)\]/;

const TestDimension = 'dimensionOne';

const Response = {
  rows: [{ id: 'v1', description: 'value1' }, { id: 'v2', description: 'value2' }],
  meta: { test: true }
};

const KegResponse = {
  rows: [{ id: 'v3', description: 'value3' }, { id: 'v4', description: 'value4' }],
  meta: { test: true }
};

const Response2 = {
  rows: [{ id: 'v1', description: 'value1' }],
  meta: { test: true }
};

const HOST = config.navi.dataSources[0].uri;

module('Unit | Service | Dimensions', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Service = this.owner.lookup('service:bard-dimensions');
    MetadataService = this.owner.lookup('service:bard-metadata');

    //setup Pretender
    Server = new Pretender(function() {
      this.get(`${HOST}/v1/dimensions/dimensionOne/values/`, request => {
        let rows = request.queryParams.filters === 'dimensionOne|id-in[v1]' ? Response2.rows : Response.rows;
        if (request.queryParams.page && request.queryParams.perPage) {
          let meta = {
            pagination: {
              currentPage: parseInt(request.queryParams.page),
              rowsPerPage: parseInt(request.queryParams.perPage),
              numberOfResults: rows.length
            }
          };
          return [
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              rows: A(rows),
              meta
            })
          ];
        }
        return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows })];
      });

      this.get(`${HOST}/v1/dimensions/dimensionOne/search/`, request => {
        let rows = request.queryParams.query === 'v1' ? Response2.rows : Response.rows;
        if (request.queryParams.page && request.queryParams.perPage) {
          let meta = {
            pagination: {
              currentPage: parseInt(request.queryParams.page),
              rowsPerPage: parseInt(request.queryParams.perPage),
              numberOfResults: rows.length
            }
          };
          return [
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              rows: A(rows),
              meta
            })
          ];
        }
        return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows })];
      });
    });

    Server.map(metadataRoutes);
    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    //shutdown pretender
    Server.shutdown();
  });

  test('Service Exists', function(assert) {
    assert.ok(!!Service, 'Service exists');
  });

  test('getLoadedStatus', function(assert) {
    assert.expect(2);

    //Mock service - dimensions are loaded in keg
    Service.set('_loadedAllDimensions', {
      dimensionOne: true
    });

    assert.equal(
      Service.getLoadedStatus(TestDimension),
      true,
      'getLoadedStatus returns expected loaded status for a loaded dimension'
    );

    assert.equal(
      Service.getLoadedStatus('dimensionTwo'),
      false,
      'getLoadedStatus returns undefined for not loaded dimension'
    );
  });

  test('_setLoadedStatus', function(assert) {
    assert.expect(1);

    Service._setLoadedStatus('dimensionTwo');

    assert.equal(
      Service.getLoadedStatus('dimensionTwo'),
      true,
      'getLoadedStatus returns expected loaded status for a loaded dimension'
    );
  });

  test('find from keg', function(assert) {
    assert.expect(3);

    let keg = Service.get('_kegAdapter.keg');
    keg.pushMany('dimension/dimensionOne', KegResponse.rows, {
      modelFactory: Object
    });

    //Mock service - dimensions are loaded in keg
    Service.set('_loadedAllDimensions', {
      dimensionOne: true
    });

    return Service.find(TestDimension, { field: 'id', values: 'v4' }).then(model => {
      assert.deepEqual(
        get(model, 'dimension'),
        TestDimension,
        'find returns a bard dimension array model with the requested dimension'
      );

      assert.deepEqual(
        get(model, '_dimensionsService'),
        Service,
        'find returns a bard dimension array model object with the service instance'
      );

      assert.deepEqual(get(model, 'content').mapBy('id'), ['v4'], 'find returns requested dimension rows');
    });
  });

  test('find from keg with pagination', function(assert) {
    assert.expect(1);

    let keg = Service.get('_kegAdapter').get('keg');
    keg.pushMany('dimension/dimensionOne', KegResponse.rows, {
      modelFactory: Object
    });

    //Mock service - dimensions are loaded in keg
    Service.set('_loadedAllDimensions', {
      dimensionOne: true
    });

    return Service.find(TestDimension, { values: 'v4' }, { page: 1, perPage: 1 }).then(model => {
      assert.deepEqual(
        get(model, 'meta'),
        {
          pagination: {
            currentPage: 1,
            rowsPerPage: 1,
            numberOfResults: get(model, 'content').length
          }
        },
        'find returns meta object for the paginated request'
      );
    });
  });

  test('find from bard', function(assert) {
    assert.expect(3);

    //Mock service - dimensions are loaded in keg
    Service.set('_loadedAllDimensions', {
      dimensionOne: false
    });

    return Service.find(TestDimension, { values: 'v1' }).then(function(model) {
      assert.deepEqual(
        get(model, 'dimension'),
        TestDimension,
        'find returns a bard dimension array model with the requested dimension'
      );

      assert.deepEqual(
        get(model, '_dimensionsService'),
        Service,
        'find returns a bard dimension array model object with the service instance'
      );

      assert.deepEqual(get(model, 'content').mapBy('id'), ['v1'], 'find returns requested dimension rows');
    });
  });

  test('find from keg with pagination', function(assert) {
    assert.expect(1);

    //Mock service - dimensions are loaded in keg
    Service.set('_loadedAllDimensions', {
      dimensionOne: false
    });

    return Service.find(TestDimension, { values: 'v1' }, { page: 1, perPage: 10 }).then(model => {
      assert.deepEqual(
        get(model, 'meta'),
        {
          pagination: {
            currentPage: 1,
            rowsPerPage: 10,
            numberOfResults: get(model, 'content').length
          }
        },
        'find returns meta object for the paginated request'
      );
    });
  });

  test('all from keg', function(assert) {
    assert.expect(1);

    let keg = Service.get('_kegAdapter').get('keg');
    keg.pushMany('dimension/dimensionOne', KegResponse.rows, {
      modelFactory: Object
    });

    //Mock service - dimensions are loaded in keg
    Service.set('_loadedAllDimensions', {
      dimensionOne: true
    });

    return Service.all(TestDimension).then(model => {
      assert.deepEqual(get(model, 'content').mapBy('id'), ['v3', 'v4'], '`all` returns all records for a dimension');
    });
  });

  test('all from bard', function(assert) {
    assert.expect(2);

    //Mock service - dimensions are loaded in keg
    Service.set('_loadedAllDimensions', {
      dimensionOne: false
    });

    return Service.all(TestDimension).then(model => {
      assert.deepEqual(get(model, 'content').mapBy('id'), ['v1', 'v2'], '`all` returns all records for a dimension');

      assert.equal(
        Service.getLoadedStatus('dimensionOne'),
        true,
        'loadedAllDimension for dimensionOne is set to true after fetching from bard'
      );
    });
  });

  test('all from bard - partial load', function(assert) {
    assert.expect(1);

    // Use pagination options to force a partial response
    return Service.all(TestDimension, { page: 1, perPage: 1 }).then(() => {
      assert.equal(
        Service.getLoadedStatus('dimensionOne'),
        false,
        'loadedAllDimension for dimensionOne is not set since only the first page was returned'
      );
    });
  });

  test('findById', function(assert) {
    assert.expect(1);

    return Service.findById(TestDimension, 'v1').then(model => {
      assert.deepEqual(get(model, 'id'), 'v1', 'findByid returns the expected dimension value');
    });
  });

  test('all and catch error', function(assert) {
    assert.expect(2);

    // Return an error
    Server.get(`${HOST}/v1/dimensions/dimensionOne/values/`, () => {
      return [
        507,
        { 'Content-Type': 'text/plain' },
        'Row limit exceeded for dimension dimensionOne: Cardinality = 4000000 exceeds maximum number of rows = 10000 allowed without filters'
      ];
    });

    return Service.all(TestDimension).catch(response => {
      assert.ok(true, 'A request error falls into the promise catch block');
      assert.equal(
        response.message,
        'Row limit exceeded for dimension dimensionOne: Cardinality = 4000000 exceeds maximum number of rows = 10000 allowed without filters',
        'Bard error is passed to catch block'
      );
    });
  });

  test('_getSearchOperator', function(assert) {
    assert.expect(5);

    let bardAdapter = get(Service, '_bardAdapter');

    return run(() => {
      assert.equal(
        Service._getSearchOperator('product-region'),
        'contains',
        '_getSearchOperator returns "contains" as search operator as expected'
      );

      set(bardAdapter, 'supportedFilterOperators', ['in', 'contains']);
      assert.equal(
        Service._getSearchOperator('product-region'),
        'contains',
        '_getSearchOperator returns appropriate highest priority search operator'
      );

      set(bardAdapter, 'supportedFilterOperators', ['not-in', 'in']);
      assert.equal(
        Service._getSearchOperator('product-region'),
        'in',
        '_getSearchOperator returns "in" as search operator as expected'
      );

      assert.throws(
        () => {
          Service._getSearchOperator();
        },
        /dimension must be defined/,
        '_getSearchOperator throws an error when no param is passed'
      );

      set(bardAdapter, 'supportedFilterOperators', ['foo', 'bar']);
      assert.throws(
        () => {
          Service._getSearchOperator('product-region');
        },
        /valid search operator not found for dimensions\/product-region/,
        '_getSearchOperator throws an error when supportedOperators is not present in the priority list'
      );
    });
  });

  test('searchValue', async function(assert) {
    assert.expect(2);

    let response3 = {
      rows: [{ id: 'v1', desc: 'value1' }, { id: 'v2', desc: 'value2' }],
      meta: { test: true }
    };

    Server.get(`${HOST}/v1/dimensions/dimensionThree/search/`, req => {
      let { query } = req.queryParams,
        rows = response3.rows.filter(row => `${row.id} ${row.description}`.includes(query));

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows })];
    });

    await settled();

    let res = await Service.searchValue('dimensionThree', 'v1');

    assert.deepEqual(
      A(res.rows).mapBy('desc'),
      ['value1'],
      'searchValue returns expected dimension values when searched for "v1"'
    );

    /* == no results == */
    res = await Service.searchValue('dimensionThree', 'foo');

    assert.deepEqual(A(res.rows), [], 'searchValue returns no dimension values as expected when searched for "foo"');

    res = await Service.searchValue('dimensionThree', 'value1, value2');
    A(res.rows).mapBy('id'), ['value1', 'value2'], 'searchValue returns dimensions when comma separated spaced value';
  });

  test('searchValueField: contains search', async function(assert) {
    assert.expect(7);

    let response3 = {
      rows: [{ id: 'v1', desc: 'value1' }, { id: 'v2', desc: 'value2' }],
      meta: { test: true }
    };

    Server.get(`${HOST}/v1/dimensions/dimensionThree/values/`, req => {
      try {
        let [, field, operator, values] = req.queryParams.filters.match(QUERY_PARAM_REGEX),
          rows = A(response3.rows).filterBy(field, values);

        assert.equal(operator, 'contains', 'Search is done using `contains`');

        return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows })];
      } catch (e) {
        assert.notOk(true, 'Query params should be parseable by the regex.');
      }
    });

    await settled();
    /* == search for string in id == */
    let res = await Service.searchValueField('dimensionThree', 'id', 'v1');

    assert.deepEqual(
      A(res.rows).mapBy('desc'),
      ['value1'],
      'searchValueField returns expected dimension values when searched for "v1" on id field'
    );

    /* == search for string in description == */
    res = await Service.searchValueField('dimensionThree', 'description', 'value1');

    assert.deepEqual(
      A(res.rows).mapBy('desc'),
      ['value1'],
      'searchValueField returns expected dimension values when searched for `value1` on description field'
    );

    /* == no results == */
    res = await Service.searchValueField('dimensionThree', 'id', 'foo');

    assert.deepEqual(
      A(res.rows).mapBy('id'),
      [],
      'searchValueField returns no dimension values as expected when searched for foo on id field'
    );

    res = await Service.searchValueField('dimensionThree', 'description', 'value1, value2');
    A(res.rows).mapBy('id'),
      ['value1', 'value2'],
      'searchValueField returns dimensions when comma separated spaced value';
  });

  test('searchValueField: point lookup', function(assert) {
    assert.expect(8);

    let response3 = {
      rows: [
        {
          id: 'v1',
          desc: 'value1'
        },
        {
          id: 'v2',
          desc: 'value2'
        }
      ],
      meta: {
        test: true
      }
    };

    Server.get(`${HOST}/v1/dimensions/dimensionTwo/values/`, req => {
      let [, field, operator, values] = req.queryParams.filters.match(QUERY_PARAM_REGEX),
        rows = A(response3.rows).filterBy(field, values);

      assert.equal(operator, 'in', 'Search is done using `in`');

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows })];
    });

    return settled().then(() => {
      //Set dimension cardinality above threshold & supportedFilterOperators for point lookup
      set(Service, '_bardAdapter.supportedFilterOperators', ['in']);

      /* == search for string in id == */
      return Service.searchValueField('dimensionTwo', 'id', 'v1').then(res => {
        assert.equal(get(res.rows, 'length'), 1, 'searchValueField returns 1 dimension values as expected');

        assert.equal(
          get(A(res.rows).objectAt(0), 'id'),
          'v1',
          'all dimension values returned by searchValueField have ids containing string "v1"'
        );

        /* == search for string in description == */
        return Service.searchValueField('dimensionTwo', 'desc', 'value1').then(res => {
          assert.equal(get(res.rows, 'length'), 1, 'searchValueField returns 1 dimension value as expected');

          assert.equal(
            get(A(res.rows).objectAt(0), 'desc'),
            'value1',
            'all dimension values returned by searchValueField have description containing string "value1"'
          );

          /* == no results == */
          return Service.searchValueField('dimensionTwo', 'id', 'foo').then(res => {
            assert.deepEqual(
              A(res.rows).mapBy('id'),
              [],
              'searchValueField returns no dimension values as expected when searched for foo on id field'
            );
          });
        });
      });
    });
  });

  test('search: low dimension cardinality', function(assert) {
    assert.expect(3);

    return settled().then(() => {
      let options = { term: 'v1' };
      return Service.search('dimensionOne', options).then(res => {
        assert.deepEqual(
          A(res).mapBy('id'),
          ['v1'],
          'search returns dimension values as expected when searched for "v1"'
        );

        options.term = 'value1';
        return Service.search('dimensionOne', options).then(res => {
          assert.deepEqual(
            A(res).mapBy('description'),
            ['value1'],
            'search returns dimension values as expected when searched for "value1"'
          );

          /* == no results == */
          options.term = 'foo';
          return Service.search('dimensionOne', options).then(res => {
            assert.deepEqual(
              A(res).mapBy('id'),
              [],
              'search returns no dimension values as expected when searched for "foo"'
            );
          });
        });
      });
    });
  });

  test('search: high dimension cardinality', function(assert) {
    assert.expect(2);

    let response3 = {
      rows: [
        {
          id: 'v1',
          description: 'value1'
        },
        {
          id: 'v2',
          description: 'value2'
        }
      ],
      meta: {
        test: true
      }
    };

    Server.get(`${HOST}/v1/dimensions/dimensionTwo/values/`, req => {
      let [, field, , values] = req.queryParams.filters.match(QUERY_PARAM_REGEX),
        rows = A(response3.rows).filterBy(field, values);

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows })];
    });

    return settled().then(() => {
      //Set dimension cardinality above threshold & supportedFilterOperators for point lookup
      set(Service, '_bardAdapter.supportedFilterOperators', ['in']);

      let options = { term: 'v1' };
      return Service.search('dimensionTwo', options).then(res => {
        assert.deepEqual(
          A(res).mapBy('id'),
          ['v1'],
          'search returns expected dimension values when searched for "EMEA Region"'
        );

        /* == no results == */
        options = { term: 'foo' };
        return Service.search('dimensionTwo', options).then(res => {
          assert.deepEqual(
            A(res).mapBy('id'),
            [],
            'search returns no dimension values as expected when searched for "foo"'
          );
        });
      });
    });
  });

  test('search: AND functionality', function(assert) {
    assert.expect(2);

    let rows = [
      {
        id: 'v1',
        description: 'value1 - foo'
      },
      {
        id: 'v2',
        description: 'value2 - foo'
      }
    ];

    Server.get(`${HOST}/v1/dimensions/dimensionThree/values/`, req => {
      let filters = get(req, 'queryParams.filters');

      if (
        filters === 'dimensionThree|desc-contains[value],dimensionThree|desc-contains[foo]' ||
        filters === 'dimensionThree|desc-contains[foo],dimensionThree|desc-contains[value]'
      ) {
        return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows })];
      }
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows: [] })];
    });

    return settled().then(() => {
      let options = { term: 'value foo' };
      return Service.search('dimensionThree', options).then(res => {
        assert.deepEqual(
          A(res).mapBy('description'),
          ['value1 - foo', 'value2 - foo'],
          'search returns expected records containing both the keywords when searched for "value foo""'
        );

        options = { term: 'foo value' };
        return Service.search('dimensionThree', options).then(res => {
          assert.deepEqual(
            A(res).mapBy('description'),
            ['value1 - foo', 'value2 - foo'],
            'search returns expected records containing both the keywords when searched for "foo value", making the keyword search order irrelevant'
          );
        });
      });
    });
  });

  test('search: pagination', function(assert) {
    assert.expect(2);

    return settled().then(() => {
      let options = { term: 'val', page: 2, limit: 1 };
      return Service.search('dimensionOne', options).then(res => {
        assert.deepEqual(A(res).mapBy('id'), ['v2'], 'search returns dimension values for page 2 as expected');

        options = { term: 'foo', page: 2 };
        assert.throws(
          () => {
            Service.search('product-region', options);
          },
          /for pagination both page and limit must be defined in search options/,
          'search throws an error when both page and limit params attributes are not present in the search options'
        );
      });
    });
  });

  test('search: low dimension cardinality with useNewSearchAPI=true', function(assert) {
    assert.expect(3);

    return settled().then(() => {
      let options = { term: 'v1', useNewSearchAPI: true };
      return Service.search('dimensionOne', options).then(res => {
        assert.deepEqual(
          A(res).mapBy('id'),
          ['v1'],
          'search returns dimension values as expected when searched for "v1"'
        );

        options.term = 'value1';
        return Service.search('dimensionOne', options).then(res => {
          assert.deepEqual(
            A(res).mapBy('description'),
            ['value1'],
            'search returns dimension values as expected when searched for "value1"'
          );

          /* == no results == */
          options.term = 'foo';
          return Service.search('dimensionOne', options).then(res => {
            assert.deepEqual(A(res), [], 'search returns no dimension values as expected when searched for "foo"');
          });
        });
      });
    });
  });

  test('search: high dimension cardinality with useNewSearchAPI=true', function(assert) {
    assert.expect(2);

    let response3 = {
      rows: [
        {
          id: 'v1',
          description: 'value1'
        },
        {
          id: 'v2',
          description: 'value2'
        }
      ],
      meta: {
        test: true
      }
    };

    Server.get(`${HOST}/v1/dimensions/dimensionTwo/search/`, req => {
      let { query } = req.queryParams,
        rows = response3.rows.filter(row => `${row.id} ${row.description}`.includes(query));

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows })];
    });

    return settled().then(() => {
      let options = { term: 'v1', useNewSearchAPI: true };
      return Service.search('dimensionTwo', options).then(res => {
        assert.deepEqual(
          A(res).mapBy('id'),
          ['v1'],
          'search returns expected dimension values when searched for "EMEA Region"'
        );

        /* == no results == */
        options = { term: 'foo', useNewSearchAPI: true };
        return Service.search('dimensionTwo', options).then(res => {
          assert.deepEqual(A(res), [], 'search returns no dimension values as expected when searched for "foo"');
        });
      });
    });
  });

  test('search: pagination with useNewSearchAPI=true', function(assert) {
    assert.expect(2);

    return settled().then(() => {
      let options = { term: 'val', page: 2, limit: 1, useNewSearchAPI: true };
      return Service.search('dimensionOne', options).then(res => {
        assert.deepEqual(A(res).mapBy('id'), ['v2'], 'search returns dimension values for page 2 as expected');

        options = { term: 'foo', page: 2, useNewSearchAPI: true };
        assert.throws(
          () => {
            Service.search('product-region', options);
          },
          /for pagination both page and limit must be defined in search options/,
          'search throws an error when both page and limit params attributes are not present in the search options'
        );
      });
    });
  });

  test('getFactoryFor', function(assert) {
    assert.expect(5);

    assert.equal(
      Service.getFactoryFor('dimensionOne').dimensionName,
      'dimensionOne',
      'getFactoryFor returned a factory with the correct dimensionName'
    );

    assert.equal(
      Service.getFactoryFor('dimensionOne').identifierField,
      'id',
      'getFactoryFor returned a factory with the correct identifierField'
    );

    assert.equal(
      Service.getFactoryFor('dimensionTwo').dimensionName,
      'dimensionTwo',
      'getFactoryFor returned a factory with the correct dimensionName'
    );

    assert.equal(
      Service.getFactoryFor('dimensionTwo').identifierField,
      'key',
      'getFactoryFor returned a factory with the correct identifierField'
    );

    assert.equal(
      Service.getFactoryFor('dimensionTwo'),
      Service.getFactoryFor('dimensionTwo'),
      'getFactoryFor returned the same factory for the same dimension'
    );
  });

  test('search: without description', function(assert) {
    assert.expect(1);

    let rows = [
      {
        id: 'v1'
      },
      {
        id: 'v2'
      }
    ];

    Server.get(`${HOST}/v1/dimensions/dimensionThree/values/`, req => {
      let filters = get(req, 'queryParams.filters');

      if (filters === 'dimensionThree|desc-contains[value]') {
        return [404];
      }

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ rows })];
    });

    let options = { term: 'value' };
    return Service.search('dimensionThree', options).then(res => {
      assert.deepEqual(
        res,
        [],
        'search returns an empty array when the server returns an error for a search query using description'
      );
    });
  });
});

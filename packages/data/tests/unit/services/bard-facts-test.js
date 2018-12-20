import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';
import config from 'ember-get-config';

let Service, Server;

const TestRequest = {
  logicalTable: {
    table: 'table1',
    timeGrain: 'grain1'
  },
  metrics: [{ metric: 'm1' }, { metric: 'm2' }],
  dimensions: [{ dimension: 'd1' }, { dimension: 'd2' }],
  filters: [
    { dimension: 'd3', operator: 'in', values: ['v1', 'v2'] },
    {
      dimension: 'd4',
      operator: 'in',
      values: ['v3', 'v4']
    }
  ],
  having: [
    {
      metric: 'm1',
      operator: 'gt',
      value: 0 // TODO switch to `values: [0]` after `value` backwards compatibility has been removed
    }
  ],
  intervals: [
    {
      start: '2015-01-03',
      end: '2015-01-04'
    }
  ]
};

const Response = {
  rows: [
    {
      table: 'table1',
      grain: 'grain1'
    }
  ],
  meta: {
    test: true
  }
};

const HOST = config.navi.dataSources[0].uri;

module('Unit | Service | Bard Facts', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Service = this.owner.lookup('service:bard-facts');

    //setup Pretender
    Server = new Pretender(function() {
      this.get(`${HOST}/v1/data/table1/grain1/d1/d2/`, function(request) {
        if (request.queryParams.page && request.queryParams.perPage) {
          return [
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              rows: {},
              meta: {
                paginated: {
                  page: request.queryParams.page,
                  perPage: request.queryParams.perPage
                }
              }
            })
          ];
        } else {
          return [200, { 'Content-Type': 'application/json' }, JSON.stringify(Response)];
        }
      });
    });
  });

  hooks.afterEach(function() {
    //shutdown pretender
    Server.shutdown();
  });

  test('Service Exists', function(assert) {
    assert.ok(!!Service, 'Service exists');
  });

  test('getURL', function(assert) {
    assert.expect(2);

    assert.deepEqual(
      Service.getURL(TestRequest),
      `${HOST}/v1/data/table1/grain1/d1/d2/?` +
        'dateTime=2015-01-03%2F2015-01-04&metrics=m1%2Cm2&' +
        'filters=d3%7Cid-in%5Bv1%2Cv2%5D%2Cd4%7Cid-in%5Bv3%2Cv4%5D&having=m1-gt%5B0%5D&' +
        'format=json',
      'Service returns the url when requested'
    );

    assert.deepEqual(
      Service.getURL(TestRequest, { format: 'jsonApi' }),
      `${HOST}/v1/data/table1/grain1/d1/d2/?` +
        'dateTime=2015-01-03%2F2015-01-04&metrics=m1%2Cm2&' +
        'filters=d3%7Cid-in%5Bv1%2Cv2%5D%2Cd4%7Cid-in%5Bv3%2Cv4%5D&having=m1-gt%5B0%5D&' +
        'format=jsonApi',
      'Service returns the url when requested with format'
    );
  });

  test('fetch', function(assert) {
    assert.expect(3);

    return Service.fetch(TestRequest).then(function(model) {
      assert.deepEqual(model.response, Response, 'Fetch returns a bardResponse model object for TestRequest');

      assert.deepEqual(model.request, TestRequest, 'Fetch returns a bardResponse model object with the TestRequest');

      assert.deepEqual(
        model._factsService,
        Service,
        'Fetch returns a bardResponse model object with the service instance'
      );
    });
  });

  test('fetch with pagination', function(assert) {
    assert.expect(1);
    return Service.fetch(TestRequest, { page: 2, perPage: 10 }).then(function(model) {
      assert.deepEqual(
        model.response,
        {
          rows: {},
          meta: {
            paginated: {
              page: '2',
              perPage: '10'
            }
          }
        },
        'Fetch returns a bardResponse model object for the paginated request'
      );
    });
  });

  test('fetch and catch error', function(assert) {
    assert.expect(2);

    // Return an error
    Server.get(`${HOST}/v1/data/table1/grain1/d1/d2/`, () => {
      return [
        507,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          reason: 'Result set too large.  Try reducing interval or dimensions.',
          description: 'Result set too large: 1541214 > 100000'
        })
      ];
    });

    return Service.fetch(TestRequest).catch(response => {
      assert.ok(true, 'A request error falls into the promise catch block');

      assert.equal(
        response.payload.reason,
        'Result set too large.  Try reducing interval or dimensions.',
        'Bard error is passed to catch block'
      );
    });
  });

  test('request builder', function(assert) {
    assert.expect(2);

    let requestBuilder = Service.request({
      metrics: [
        {
          metric: 'pageViews',
          parameters: {
            type: 'dimension'
          }
        }
      ]
    });

    let newRequest = requestBuilder.addMetrics({ metric: 'adClicks' });

    assert.deepEqual(
      newRequest.metrics,
      [
        {
          metric: 'pageViews',
          parameters: {
            type: 'dimension'
          }
        },
        {
          metric: 'adClicks'
        }
      ],
      'Request returns a builder interface that allows extension'
    );

    assert.notEqual(Service.request(newRequest), newRequest, 'Each call to request returns a new builder instance');
  });
});

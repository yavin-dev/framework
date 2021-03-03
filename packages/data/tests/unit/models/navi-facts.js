import { module, test } from 'qunit';
import NaviFactsModel from 'navi-data/models/navi-facts';

module('Unit | Model | navi facts', function (hooks) {
  let Response, Payload;

  hooks.beforeEach(function () {
    Payload = {
      request: {
        request: 'object',
      },
      response: {
        rows: [
          {
            dateTime: '2014-04-02 00:00:00.000',
            gender: '-1',
            pageViews: 15,
          },
          {
            dateTime: '2014-04-02 00:00:00.000',
            gender: 'f',
            pageViews: 27,
          },
          {
            dateTime: '2014-04-02 00:00:00.000',
            gender: 'm',
            pageViews: 26,
          },
        ],
        meta: {
          pagination: {
            currentPage: 3,
            rowsPerPage: 10,
            numberOfResults: 34,
          },
        },
      },
    };

    Response = NaviFactsModel.create(Payload);

    //Mocking facts service
    Response.set('_factService', {
      fetch: (request, options) => ({
        request,
        options,
      }),
    });
  });

  test('it properly hydrates properties', function (assert) {
    assert.expect(2);

    assert.deepEqual(Response.rows, Payload.rows, 'rows property was properly hydrated');

    assert.equal(Response.request, Payload.request, 'request property was properly hydrated');
  });

  test('pagination methods', function (assert) {
    assert.expect(2);

    //Mocking facts service
    Response.set('_factService', {
      fetchNext: () => {
        assert.ok('The service`s fetch Next method is invoked with the response and request');
      },
    });

    Response.next();

    //Mocking facts service
    Response.set('_factService', {
      fetchPrevious: () => {
        assert.ok('The service`s fetch Previous method is invoked with the response and request');
      },
    });

    Response.previous();
  });
});

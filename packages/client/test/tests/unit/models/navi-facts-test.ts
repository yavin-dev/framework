import { module, test } from 'qunit';
import NaviFactsModel from '@yavin/client/models/navi-facts';
import type { NaviFactsPayload } from '@yavin/client/models/navi-facts';
import NaviFactResponse from '@yavin/client/models/navi-fact-response';
import { nullInjector } from '../../helpers/injector';

const Payload: NaviFactsPayload = {
  request: {
    //@ts-expect-error - mock request
    request: null,
  },
  response: new NaviFactResponse(nullInjector, {
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
  }),
};

module('Unit | Model | navi facts', function (hooks) {
  let Response: NaviFactsModel;
  let factService: unknown;

  hooks.beforeEach(function () {
    Response = new NaviFactsModel(
      {
        lookup(_type, _name) {
          return factService;
        },
      },
      Payload
    );
  });

  test('it properly hydrates properties', function (assert) {
    assert.expect(2);

    assert.deepEqual(Response.response.rows, Payload.response.rows, 'rows property was properly hydrated');

    assert.equal(Response.request, Payload.request, 'request property was properly hydrated');
  });

  test('pagination methods', function (assert) {
    assert.expect(2);

    //Mocking facts service
    factService = {
      fetchNext: {
        perform: () => {
          assert.ok('The service`s fetch Next method is invoked with the response and request');
        },
      },
    };

    Response.next();

    //Mocking facts service
    factService = {
      fetchPrevious: {
        perform: () => {
          assert.ok('The service`s fetch Previous method is invoked with the response and request');
        },
      },
    };

    Response.previous();
  });
});

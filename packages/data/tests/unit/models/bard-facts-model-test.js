import { get } from '@ember/object';
import { module, test } from 'qunit';
import BardFactsModel from 'navi-data/models/bard-facts';

let BardResponse, Payload;

module('Unit | Bard Facts Model', function(hooks) {
  hooks.beforeEach(function() {
    Payload = {
      request: {
        request: 'object'
      },
      response: {
        rows: [
          {
            dateTime: '2014-04-02 00:00:00.000',
            gender: '-1',
            pageViews: 15
          },
          {
            dateTime: '2014-04-02 00:00:00.000',
            gender: 'f',
            pageViews: 27
          },
          {
            dateTime: '2014-04-02 00:00:00.000',
            gender: 'm',
            pageViews: 26
          }
        ],
        meta: {
          pagination: {
            currentPage: 3,
            rowsPerPage: 10,
            numberOfResults: 34
          }
        }
      }
    };

    BardResponse = BardFactsModel.create(Payload);

    //Mocking facts service
    BardResponse.set('_factsService', {
      fetch: (request, options) => ({
        request,
        options
      })
    });
  });

  test('it properly hydrates properties', function(assert) {
    assert.expect(2);

    assert.deepEqual(get(BardResponse, 'rows'), Payload.rows, 'rows property was properly hydrated');

    assert.equal(get(BardResponse, 'request'), Payload.request, 'request property was properly hydrated');
  });

  test('pagination methods', function(assert) {
    assert.expect(6);

    assert.deepEqual(
      BardResponse.next(),
      {
        request: {
          request: 'object'
        },
        options: {
          page: 4,
          perPage: 10
        }
      },
      'Next method request the data for the page next to the current page'
    );

    Payload.response.meta.pagination.currentPage = 4;

    assert.deepEqual(BardResponse.next(), null, 'Next method returns null when total pages is exceeded');

    Payload.response.meta.pagination.currentPage = 2;

    assert.deepEqual(
      BardResponse.previous(),
      {
        request: {
          request: 'object'
        },
        options: {
          page: 1,
          perPage: 10
        }
      },
      'Previous method requests the data for the page previous to the current page'
    );

    Payload.response.meta.pagination.currentPage = 1;

    assert.deepEqual(BardResponse.previous(), null, 'Previous method returns null trying previous from first page');

    delete Payload.response.meta.pagination;

    assert.deepEqual(BardResponse.previous(), null, 'Previous method returns null when there is no pagination options');

    assert.deepEqual(BardResponse.next(), null, 'Next method returns null when there is no pagination options');
  });
});

import Ember from 'ember';
import { module, test } from 'qunit';
import BardDimensionArray from 'navi-data/models/bard-dimensions';

const { get } = Ember;

let Response, Payload;

module('Unit | Model | Bard Dimension Array', {
  beforeEach() {
    Payload = {
      rows: [
        {
          id: '1',
          description: 'One'
        },
        {
          id: '2',
          description: 'Two'
        }
      ],
      meta: {
        pagination: {
          currentPage: 3,
          rowsPerPage: 10,
          numberOfResults: 34
        }
      }
    };

    Response = BardDimensionArray.create({
      dimension: 'd1',
      _response: Payload
    });

    //Mocking dimension service
    Response.reopen({
      _dimensionsService: {
        all(dimension, options) {
          return {
            dimension,
            options
          };
        }
      }
    });
  }
});

test('it properly hydrates properties', function(assert) {
  assert.expect(2);

  assert.deepEqual(
    get(Response, 'content'),
    Payload.rows,
    '`content` was properly hydrated'
  );

  assert.equal(
    get(Response, 'dimension'),
    'd1',
    '`dimension` property was properly hydrated'
  );
});

test('pagination methods', function(assert) {
  assert.expect(6);

  assert.deepEqual(
    Response.next(),
    {
      dimension: 'd1',
      options: {
        page: 4,
        perPage: 10
      }
    },
    'Next method request the dimension values for the page next to the current page'
  );

  Payload.meta.pagination.currentPage = 4;

  assert.deepEqual(
    Response.next(),
    null,
    'Next method returns null when total pages is exceeded'
  );

  Payload.meta.pagination.currentPage = 2;

  assert.deepEqual(
    Response.previous(),
    {
      dimension: 'd1',
      options: {
        page: 1,
        perPage: 10
      }
    },
    'Previous method requests the data for the page previous to the current page'
  );

  Payload.response.meta.pagination.currentPage = 1;

  assert.deepEqual(
    Response.previous(),
    null,
    'Previous method returns null trying previous from first page'
  );

  delete Payload.response.meta.pagination;

  assert.deepEqual(
    BardDimensionArray.previous(),
    null,
    'Previous method returns null when there is no pagination options'
  );

  assert.deepEqual(
    BardDimensionArray.next(),
    null,
    'Next method returns null when there is no pagination options'
  );
});

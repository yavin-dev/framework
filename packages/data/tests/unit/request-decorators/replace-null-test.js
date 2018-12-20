import { module, test } from 'qunit';
import Decorators from 'navi-data/request-decorators/replace-null';

module('Unit | Request Decorator | Global Decorator', function() {
  test('Filter update', function(assert) {
    assert.expect(4);

    let request = {
        filters: [
          {
            dimension: 'swordType',
            operator: 'in',
            values: ['Biggoron', 'Master']
          },
          {
            dimension: 'potion',
            operator: 'null',
            values: []
          },
          {
            dimension: 'songList',
            operator: 'notnull',
            values: []
          },
          {
            dimension: 'shield',
            operator: 'notnull',
            values: ['Mirror', 'Deku']
          }
        ],
        responseFormat: 'json'
      },
      decoratedRequest = Decorators.replaceNullFilter(request);

    assert.deepEqual(
      decoratedRequest.filters[0],
      {
        dimension: 'swordType',
        operator: 'in',
        values: ['Biggoron', 'Master']
      },
      'Sword Type remains unchanged'
    );

    assert.deepEqual(
      decoratedRequest.filters[1],
      {
        dimension: 'potion',
        operator: 'in',
        values: ['""']
      },
      'Potion operator was replaced with "in" and values were replaced with ""'
    );

    assert.deepEqual(
      decoratedRequest.filters[2],
      {
        dimension: 'songList',
        operator: 'notin',
        values: ['""']
      },
      'SongList operator was replaced with "notin" and values replaced with ""'
    );
    assert.deepEqual(
      decoratedRequest.filters[3],
      {
        dimension: 'shield',
        operator: 'notin',
        values: ['""']
      },
      'shield operator was replaced with "notin" and values replaced with ""'
    );
  });
});

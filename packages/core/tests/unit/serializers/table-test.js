import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { getOwner } from '@ember/application';

let Serializer, Model;

moduleFor('serializer:table', 'Unit | Serializer | table', {
  needs: ['model:table'],
  beforeEach() {
    setupMock();
    Serializer = this.subject();
    const store = getOwner(this).lookup('service:store');
    Model = store.modelFor('table');
  },
  afterEach() {
    teardownMock();
  }
});

test('normalize', function(assert) {
  assert.expect(2);

  let initialMetadata = {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            field: 'clicks',
            type: 'metric',
            displayName: 'Clicks'
          },
          {
            field: { metric: 'pageViews', parameters: {} },
            type: 'metric',
            displayName: 'Page Views'
          },
          {
            field: 'revenue(currency=USD)',
            type: 'threshold',
            displayName: 'Revenue (USD)'
          },
          {
            field: 'gender',
            type: 'dimension',
            displayName: 'Gender'
          },
          {
            field: { dimension: 'age' },
            type: 'dimension',
            displayName: 'Age'
          },
          {
            field: 'dateTime',
            type: 'dateTime',
            displayName: 'Date'
          }
        ]
      }
    },
    expectedPayload = {
      data: {
        id: null,
        relationships: {},
        type: 'table',
        attributes: {
          type: 'table',
          version: 1,
          metadata: {
            columns: [
              {
                field: { metric: 'clicks', parameters: {} },
                type: 'metric',
                displayName: 'Clicks'
              },
              {
                field: { metric: 'pageViews', parameters: {} },
                type: 'metric',
                displayName: 'Page Views'
              },
              {
                field: { metric: 'revenue', parameters: { currency: 'USD' } },
                type: 'threshold',
                displayName: 'Revenue (USD)'
              },
              {
                field: { dimension: 'gender' },
                type: 'dimension',
                displayName: 'Gender'
              },
              {
                field: { dimension: 'age' },
                type: 'dimension',
                displayName: 'Age'
              },
              {
                field: { dateTime: 'dateTime' },
                type: 'dateTime',
                displayName: 'Date'
              }
            ]
          }
        }
      }
    };

  assert.deepEqual(Serializer.normalize(), { data: null }, 'null is returned for an undefined response');

  assert.deepEqual(
    Serializer.normalize(Model, initialMetadata),
    expectedPayload,
    'Field strings are converted to objects and other fields are left alone'
  );
});

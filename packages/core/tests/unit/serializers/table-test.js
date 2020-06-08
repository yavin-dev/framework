import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

let Serializer, Model;

module('Unit | Serializer | table', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:table');
    const store = this.owner.lookup('service:store');
    Model = store.modelFor('table');
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
              displayName: 'Page Views',
              format: '',
              foo: 'bar'
            },
            {
              attributes: { name: 'revenue', parameters: { currency: 'EUR' } },
              type: 'metric',
              displayName: 'Revenue (EUR)'
            },
            {
              field: 'revenue(currency=USD)',
              type: 'metric',
              displayName: 'Revenue (USD)',
              format: ''
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
              attributes: { name: 'platform' },
              type: 'dimension',
              displayName: 'Platform',
              foo: 'bar'
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
                  attributes: { name: 'clicks', parameters: {} },
                  type: 'metric',
                  displayName: 'Clicks'
                },
                {
                  attributes: { name: 'pageViews', parameters: {}, format: '' },
                  type: 'metric',
                  displayName: 'Page Views',
                  foo: 'bar'
                },
                {
                  attributes: { name: 'revenue', parameters: { currency: 'EUR' } },
                  type: 'metric',
                  displayName: 'Revenue (EUR)'
                },
                {
                  attributes: { name: 'revenue', parameters: { currency: 'USD' }, format: '' },
                  type: 'metric',
                  displayName: 'Revenue (USD)'
                },
                {
                  attributes: { name: 'gender' },
                  type: 'dimension',
                  displayName: 'Gender'
                },
                {
                  attributes: { name: 'age' },
                  type: 'dimension',
                  displayName: 'Age'
                },
                {
                  attributes: { name: 'platform' },
                  type: 'dimension',
                  displayName: 'Platform',
                  foo: 'bar'
                },
                {
                  attributes: { name: 'dateTime' },
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
      'Columns with a `field` property are mapped to ones with `attributes` and other columns are left alone'
    );
  });
});

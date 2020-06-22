import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

let Store;

module('Unit | Serializer | Report', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('Serializing record', async function(assert) {
    assert.expect(3);

    let expectedResult = {
      data: {
        attributes: {
          title: 'Hyrule News',
          request: {
            logicalTable: {
              table: 'network',
              timeGrain: 'day'
            },
            metrics: [{ metric: 'adClicks' }, { metric: 'navClicks' }],
            dimensions: [{ dimension: 'property' }],
            filters: [],
            having: [],
            sort: [
              {
                metric: 'navClicks',
                direction: 'asc'
              }
            ],
            intervals: [
              {
                end: '2015-11-16 00:00:00.000',
                start: '2015-11-09 00:00:00.000'
              }
            ],
            bardVersion: 'v1',
            requestVersion: 'v1',
            dataSource: 'dummy'
          },
          visualization: {
            type: 'line-chart',
            version: 1,
            metadata: {
              axis: {
                y: {
                  series: {
                    type: 'dimension',
                    config: {
                      metric: {
                        metric: 'adClicks',
                        parameters: {}
                      },
                      dimensionOrder: ['property'],
                      dimensions: [
                        { name: 'Property 1', values: { property: '114' } },
                        { name: 'Property 2', values: { property: '100001' } },
                        { name: 'Property 3', values: { property: '100002' } }
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        relationships: {
          author: {
            data: {
              type: 'users',
              id: 'navi_user'
            }
          }
        },
        type: 'reports'
      }
    };

    let report = await Store.findRecord('report', 1);
    assert.ok(report.get('createdOn'), 'Report model contains "createdOn" attribute');

    assert.ok(report.get('updatedOn'), 'Report model contains "updatedOn" attribute');

    assert.deepEqual(
      report.serialize(),
      expectedResult,
      'Serialize method does not serialize createdOn and updatedOn attributes as expected'
    );
  });

  test('Serializing multi param request', async function(assert) {
    assert.expect(1);

    let expectedResult = {
      data: {
        attributes: {
          title: 'Revenue report 2',
          request: {
            logicalTable: {
              table: 'tableA',
              timeGrain: 'day'
            },
            metrics: [
              {
                metric: 'revenue',
                parameters: {
                  currency: 'USD',
                  as: 'm1'
                }
              },
              {
                metric: 'revenue',
                parameters: {
                  currency: 'EUR',
                  as: 'm2'
                }
              }
            ],
            dimensions: [{ dimension: 'property' }],
            filters: [],
            having: [],
            sort: [],
            intervals: [
              {
                end: '2018-02-16 00:00:00.000',
                start: '2018-02-09 00:00:00.000'
              }
            ],
            bardVersion: 'v1',
            requestVersion: 'v1',
            dataSource: 'dummy'
          },
          visualization: {
            type: 'table',
            version: 1,
            metadata: {
              columns: [
                {
                  attributes: {
                    name: 'dateTime'
                  },
                  type: 'dateTime',
                  displayName: 'Date'
                },
                {
                  attributes: {
                    name: 'property'
                  },
                  type: 'dimension',
                  displayName: 'Property'
                },
                {
                  attributes: {
                    name: 'revenue',
                    parameters: {
                      currency: 'USD'
                    }
                  },
                  type: 'metric',
                  displayName: 'Revenue (USD)'
                },
                {
                  attributes: {
                    name: 'revenue',
                    parameters: {
                      currency: 'EUR'
                    }
                  },
                  type: 'metric',
                  displayName: 'Revenue (EUR)'
                }
              ]
            }
          }
        },
        relationships: {
          author: {
            data: {
              type: 'users',
              id: 'navi_user'
            }
          }
        },
        type: 'reports'
      }
    };

    let report = await Store.findRecord('report', 8);

    assert.deepEqual(
      report.serialize(),
      expectedResult,
      'Serialize report with parameterized metric serializes as expected'
    );
  });
});

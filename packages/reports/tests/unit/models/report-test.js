import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import config from 'ember-get-config';
import Mirage from 'ember-cli-mirage';
import DeliverableItem from 'navi-reports/models/deliverable-item';

const { get, getOwner } = Ember;

let Store,
    MetadataService;

const ExpectedRequest = {
        logicalTable: {
          table: 'network',
          timeGrain: 'day'
        },
        metrics: [
          { metric: 'adClicks' },
          { metric: 'navClicks' }
        ],
        dimensions: [
          { dimension: 'property' }
        ],
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
        bardVersion:    'v1',
        requestVersion: 'v1'
      },
      ExpectedReport = {
        data: {
          attributes: {
            title: 'Hyrule News',
            request: ExpectedRequest,
            visualization: {
              type: 'line-chart',
              version: 1,
              metadata: {
                axis: {
                  y: {
                    series: {
                      type: 'dimension',
                      config: {
                        metric: 'adClicks',
                        dimensionOrder: [ 'property' ],
                        dimensions: [
                          {  name: 'Property 1', values: {  property: '114' } },
                          {  name: 'Property 2', values: {  property: '100001' } },
                          {  name: 'Property 3', values: {  property: '100002' } }
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

moduleForModel('report', 'Unit | Model | report', {
  needs: [
    'adapter:report',
    'adapter:user',
    'adapter:delivery-rule',
    'adapter:bard-metadata',
    'adapter:dimensions/bard',
    'model:user',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/having',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'model:delivery-rule',
    'model:deliverable-item',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'model:line-chart',
    'model:table',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'validator:request-time-grain',
    'validator:request-filters',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'service:bard-metadata',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'serializer:bard-request/fragments/metric',
    'serializer:bard-request/request',
    'serializer:visualization',
    'serializer:report',
    'serializer:user',
    'serializer:delivery-rule',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:user',
    'service:bard-dimensions',
    'validator:recipients',
    'validator:request-time-grain'
  ],

  beforeEach() {
    setupMock();
    Store = this.store();
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    MetadataService.loadMetadata();
  },
  afterEach() {
    teardownMock();
  }
});

test('Retrieving records', function(assert) {
  assert.expect(3);

  return Ember.run(() => {
    return Store.findRecord('report', 1).then(report => {

      assert.ok(report, 'Found report with id 1');
      assert.ok(report instanceof DeliverableItem, 'Report should be instance of DeliverableItem');

      assert.deepEqual(report.serialize(),
        ExpectedReport,
        'Fetched report has all attributes as expected');
    });
  });
});

test('Coalescing find requests', function(assert) {
  assert.expect(1);

  server.urlPrefix = `${config.navi.appPersistence.uri}`;
  server.get('/reports', (schema, request) => {
    assert.equal(request.queryParams['filter[reports.id]'],
      '1,2,4',
      'Multiple find requests are grouped using filter query param');

    // Test case doesn't care about actual repsonse, so skip mocking it
    return new Mirage.Response(204);
  });

  return Ember.run(() => {
    return Ember.RSVP.all([
      this.store().findRecord('report', 1),
      this.store().findRecord('report', 2),
      this.store().findRecord('report', 4)
    ]).catch(() => 'Ignore empty response error');
  });
});

test('Saving records', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('user', 'navi_user').then(user => {

      let report = {
        title: 'New Report',
        author: user,
        request: null
      };

      return Store.createRecord('report', report).save().then((savedReport) => {
        let id = savedReport.get('id');

        Store.unloadAll('report'); // flush cache/store

        return Store.findRecord('report', id).then(() => {
          assert.ok(true, 'Newly created report is persisted');
        });
      });
    });
  });
});

test('Cloning Reports', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    return Store.findRecord('report', 1).then((model) => {
      let clonedModel = model.clone(Store),
          expectedTitle = model.toJSON().title;

      assert.equal(clonedModel.title,
        expectedTitle,
        'The report model is cloned as expected');

      assert.deepEqual(clonedModel.visualization.toJSON(),
        model.get('visualization').toJSON(),
        'Visualization config is also cloned');
    });
  });
});

test('isOwner', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    // Make sure user is loaded into store
    return Store.findRecord('user', 'navi_user').then(() => {
      return Store.findRecord('report', 3).then((model) => {
        assert.notOk(model.get('isOwner'),
          'isOwner returns false when author does not match user');

        return Store.findRecord('report', 1).then((model) => {
          assert.ok(model.get('isOwner'),
            'isOwner returns true when user is the author of the report');
        });
      });
    });
  });
});

test('isFavorite', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    // Make sure user is loaded into store
    return Store.findRecord('user', 'navi_user').then(() => {
      return Store.findRecord('report', 1).then((model) => {
        assert.notOk(model.get('isFavorite'),
          'isFavorite returns false when report is not in favorite list');

        return Store.findRecord('report', 2).then((model) => {
          assert.ok(model.get('isFavorite'),
            'isFavorite returns true when report is in favorite list');
        });
      });
    });
  });
});

test('tempId', function(assert) {
  assert.expect(3);

  return Ember.run(() => {
    return Store.findRecord('user', 'navi_user').then(author => {
      let report = Store.createRecord('report', {
        author,
        request: null
      });

      assert.ok(!!get(report, 'tempId'),
        '`tempId` exists when `id` does not');

      assert.equal(get(report, 'tempId'),
        get(report, 'tempId'),
        '`tempId` is always the same value');

      return report.save().then(() => {
        assert.notOk(!!get(report, 'tempId'),
          '`tempId` is null when `id` exists');
      });
    });
  });
});

test('delivery rules relationship', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('report', 3).then(reportModel => {
      return reportModel.get('deliveryRules').then(rules => {
        assert.equal(rules.get('firstObject'),
          Store.peekRecord('deliveryRule', 1),
          'report deliveryRule property contains deliveryRule model');
      });
    });
  });
});

test('Validations', function(assert) {
  assert.expect(5);

  return Ember.run(() => {
    return Store.findRecord('report', 1).then(reportModel => {
      return reportModel.validate().then(({ validations }) => {
        assert.ok(validations.get('isValid'), 'report is valid');
        assert.equal(validations.get('messages').length,
          0,
          'There are no validation errors');
        reportModel.set('title', '');
        return reportModel.validate().then(({model, validations}) => {
          assert.notOk(validations.get('isValid'), 'report is invalid');
          assert.equal(validations.get('messages').length,
            1,
            'There is one validation error');
          assert.notOk(model.get('validations.attrs.title.isValid'),
            'Title must have a value');
        });
      });
    });
  });
});

test('deliveryRuleForUser', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('user', 'navi_user').then(() => {
      return Store.findRecord('report', 3).then(reportModel => {
        reportModel.user = {
          getUser: () => { return Store.peekRecord('user', 'navi_user'); }
        };

        return reportModel.get('deliveryRuleForUser').then(rule => {
          assert.deepEqual(rule,
            Store.peekRecord('deliveryRule', 1),
            'deliveryRule is fetched for current user');
        });
      });
    });
  });
});

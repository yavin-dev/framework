import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

var Store, MetadataService;

module('Unit | Model | Fragment | BardRequest - Metric', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');

    return MetadataService.loadMetadata().then(() => {
      //Add instances to the store
      return run(() => {
        Store.pushPayload({
          data: {
            id: 1,
            type: 'fragments-mock',
            attributes: {
              metrics: [{ metric: 'uniqueIdentifier' }]
            }
          }
        });
      });
    });
  });

  test('Model using the Metric Fragment', function(assert) {
    assert.expect(4);

    let mockModel = Store.peekRecord('fragments-mock', 1);

    run(() => {
      /* == Getter Method == */
      assert.equal(
        mockModel
          .get('metrics')
          .objectAt(0)
          .get('metric.longName'),
        'Unique Identifiers',
        'The property metric `ui` was deserialized to the metric object with longName `Unique Identifiers`'
      );

      /* == Setter Method == */
      mockModel
        .get('metrics')
        .objectAt(0)
        .set('metric', MetadataService.getById('metric', 'pageViews'));
    });

    assert.equal(
      mockModel
        .get('metrics')
        .objectAt(0)
        .get('metric.longName'),
      'Page Views',
      'The property metric is set as `Page Views` using the setter'
    );

    assert.equal(
      mockModel
        .get('metrics')
        .objectAt(0)
        .get('canonicalName'),
      'pageViews',
      'The property metric is set as `Page Views` using the setter'
    );

    /* == Serialize == */
    assert.deepEqual(
      mockModel.serialize().data.attributes.metrics,
      [{ metric: 'pageViews' }],
      'The model object was serialized correctly'
    );
  });

  test('Model metric that has parameters', function(assert) {
    assert.expect(5);
    return run(() => {
      Store.pushPayload({
        data: {
          id: 2,
          type: 'fragments-mock',
          attributes: {
            metrics: [
              { metric: 'revenue', parameters: { currency: 'USD' } },
              {
                metric: 'totalClicks',
                parameters: { c: 'one', a: 'two', b: 'three' }
              }
            ]
          }
        }
      });
      let mockModel = Store.peekRecord('fragments-mock', 2);

      let metricModel = mockModel.get('metrics').objectAt(0);
      assert.equal(metricModel.get('parameters.currency'), 'USD', 'Should see USD as currency parameter');
      assert.equal(metricModel.get('canonicalName'), 'revenue(currency=USD)', 'Canonical name should render correctly');

      let multiParamMetricModel = mockModel.get('metrics').objectAt(1);
      assert.deepEqual(
        Object.keys(multiParamMetricModel.get('parameters')),
        ['c', 'a', 'b'],
        'Check that keys are not alpha ordered'
      );
      assert.equal(
        multiParamMetricModel.get('canonicalName'),
        'totalClicks(a=two,b=three,c=one)',
        'Canonical name params should be in alpha order'
      );

      /* == Serialize == */
      assert.deepEqual(
        mockModel.serialize().data.attributes.metrics,
        [
          { metric: 'revenue', parameters: { currency: 'USD' } },
          {
            metric: 'totalClicks',
            parameters: { c: 'one', a: 'two', b: 'three' }
          }
        ],
        'The model object was serialized correctly'
      );
    });
  });

  test('Validations', function(assert) {
    assert.expect(5);

    let metric = run(() =>
      Store.peekRecord('fragments-mock', 1)
        .get('metrics')
        .objectAt(0)
    );

    metric.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Metric is valid');
      assert.equal(validations.get('messages').length, 0, 'There are no validation errors');
    });

    metric.set('metric', undefined);

    metric.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Metric is invalid');

      assert.equal(validations.get('messages').length, 1, 'There is one validation errors');

      assert.equal(
        validations.get('messages').objectAt(0),
        'The metric field cannot be empty',
        'Metric cannot be empty is a part of the error messages'
      );
    });

    return metric;
  });
});

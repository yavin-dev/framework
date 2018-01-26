import Ember from 'ember';
import { module, test } from 'qunit';
import MetricMetadataModel from 'navi-data/models/metadata/metric';

const { get } = Ember;

let Payload,
    Metric;

module('Unit | Metadata Model | Metric', {
  beforeEach() {
    Payload = {
      name: 'dayAvgPageViews',
      longName: 'Page Views (Daily Avg)',
      category: 'Page Views',
      valueType: 'number'
    };

    Metric = MetricMetadataModel.create(Payload);
  }
});

test('factory has identifierField defined', function(assert) {
  assert.expect(1);

  assert.equal(get(MetricMetadataModel, 'identifierField'),
    'name',
    'identifierField property is set to `name`');
});

test('it properly hydrates properties', function(assert) {
  assert.expect(4);

  assert.deepEqual(get(Metric, 'name'),
    Payload.name,
    'name property is hydrated properly');

  assert.equal(get(Metric, 'longName'),
    Payload.longName,
    'longName property was properly hydrated');

  assert.equal(get(Metric, 'category'),
    Payload.category,
    'category property was properly hydrated');

  assert.equal(get(Metric, 'valueType'),
    Payload.valueType,
    'value type property was properly hydrated');
});

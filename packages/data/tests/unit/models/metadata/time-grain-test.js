import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

const { get, getOwner, setOwner } = Ember;

let Payload,
    Model,
    Keg;

moduleFor('model:metadata/time-grain', 'Unit | Metadata Model | Time Grain', {
  needs: [
    'service:keg',
    'model:metadata/dimension',
    'model:metadata/metric'
  ],

  beforeEach() {
    Payload = {
      'name': 'month',
      'longName': 'Month',
      'description': 'The table A month grain',
      'metricIds': ['pv'],
      'retention': 'P24M',
      'dimensionIds': ['age', 'gender']
    };

    Model = this.subject(Payload);
    setOwner(Model, getOwner(this));

    //Looking up and injecting keg into the model
    Keg = getOwner(Model).lookup('service:keg');
  }
});

test('it properly hydrates properties', function(assert) {
  assert.expect(6);

  assert.deepEqual(get(Model, 'name'),
    Payload.name,
    'name property is hydrated properly');

  assert.equal(get(Model, 'longName'),
    Payload.longName,
    'longName property was properly hydrated');

  assert.equal(get(Model, 'description'),
    Payload.description,
    'description property was properly hydrated');

  assert.equal(get(Model, 'metricIds'),
    Payload.metricIds,
    'metricIds array was properly hydrated');

  assert.equal(get(Model, 'dimensionIds'),
    Payload.dimensionIds,
    'dimensionIds array was properly hydrated');

  assert.equal(get(Model, 'retention'),
    Payload.retention,
    'retention property was properly hydrated');
});

test('metrics and dimensions', function(assert){
  assert.expect(2);

  let dims = [{
        id: 'age',
        name: 'age',
        longName: 'Age',
        category: 'Audience',
        cardinality: 13
      },{
        id: 'gender',
        name: 'gender',
        longName: 'Gender',
        category: 'Audience',
        cardinality: 5
      }
      ],
      metrics = [{
        id: 'pv',
        name: 'Page Views',
        longName: 'Page Views',
        category: 'Page Views'
      }];


  Keg.pushMany('metadata/dimension',dims);
  Keg.pushMany('metadata/metric', metrics);

  assert.deepEqual(get(Model, 'metrics'),
    [ Keg.getById('metadata/metric', 'pv') ],
    'Metrics are looked up from the keg to form an array of metric models');

  assert.deepEqual(get(Model, 'dimensions'),
    [ Keg.getById('metadata/dimension', 'age'), Keg.getById('metadata/dimension', 'gender') ],
    'Dimensions are looked up from the keg to form an array of dimension models');
});

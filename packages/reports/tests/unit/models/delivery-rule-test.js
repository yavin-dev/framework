import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

const { getOwner } = Ember;

let Store,
    MetadataService;

const ExpectedDeliveryRule = {
  createdOn: '2017-01-01 00:00:00.000',
  updatedOn: '2017-01-01 00:00:00.000',
  owner: 'navi_user',
  deliveredItem: '3',
  deliveryType: 'report',
  frequency: 'week',
  schedulingRules: {
    stopAfter: '2017-09-04 00:00:00',
    every: '2 weeks'
  },
  format: {
    type: 'csv'
  },
  recipients: [ 'user-or-list1@navi.io', 'user-or-list2@navi.io' ],
  version: 1
};

moduleForModel('delivery-rule', 'Unit | Model | delivery rule', {
  // Specify the other units that are required for this test.
  needs: [
    'model:delivery-rule',
    'model:report',
    'adapter:report',
    'adapter:user',
    'adapter:delivery-rule',
    'adapter:bard-metadata',
    'adapter:dimensions/bard',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:sort',
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
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'validator:format',
    'validator:recipients',
    'validator:exclusion',
    'service:bard-metadata',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'serializer:visualization',
    'serializer:report',
    'serializer:user',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:user',
    'service:bard-dimensions',
    'model:user',
    'serializer:delivery-rule',
  ],

  beforeEach() {
    setupMock();
    Store = this.store();
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  },

  afterEach() {
    teardownMock();
  }
});

test('Retrieving records', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
      assert.ok(deliveryRule, 'Found deliveryRule with id 1');

      assert.deepEqual(deliveryRule.toJSON(),
        ExpectedDeliveryRule,
        'Fetched deliveryRule has all attributes as expected');
    });
  });
});

test('user relationship', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('user', 'navi_user').then(userModel => {
      return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
        return deliveryRule.get('owner').then(owner => {
          assert.equal(owner,
            userModel,
            'deliveryRule author property contains user model');
        });
      });
    });
  });
});

test('delivered item relationship', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('report', 3).then(reportModel => {
      return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
        return deliveryRule.get('deliveredItem').then(item => {
          assert.equal(item,
            reportModel,
            'deliveryRule deliveredItem property contains report model');
        });
      });
    });
  });
});

test('Validations', function(assert) {
  assert.expect(14);

  return Ember.run(() => {
    return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
      return deliveryRule.get('deliveredItem').then(() => {
        deliveryRule.validate().then(({ validations }) => {
          assert.ok(validations.get('isValid'), 'deliveryRule is valid');
          assert.equal(validations.get('messages').length,
            0,
            'There are no validation errors');
        });

        //setting format to null
        deliveryRule.set('format', null);
        deliveryRule.validate().then(({model, validations}) => {
          assert.notOk(validations.get('isValid'), 'deliveryRule is invalid');
          assert.equal(validations.get('messages').length,
            1,
            'One Field is invalid in the deliveryRule model');
          assert.notOk(model.get('validations.attrs.format.isValid'),
            'Delivery format must have a value');
        });

        //setting frequency to null
        deliveryRule.set('frequency', null);
        deliveryRule.validate().then(({model, validations}) => {
          assert.notOk(validations.get('isValid'), 'deliveryRule is invalid');
          assert.equal(validations.get('messages').length,
            2,
            'Two Fields are invalid in the deliveryRule model');
          assert.notOk(model.get('validations.attrs.frequency.isValid'),
            'Delivery frequency must have a value');
        });

        //setting no recipients
        deliveryRule.set('recipients', []);
        deliveryRule.validate().then(({model, validations}) => {
          assert.notOk(validations.get('isValid'), 'deliveryRule is invalid');
          assert.equal(validations.get('messages').length,
            3,
            'Three Fields are invalid in the deliveryRule model');
          assert.notOk(model.get('validations.attrs.recipients.isValid'),
            'There must be at least one recipient');
        });

        //setting recipients with invalid emails
        deliveryRule.set('recipients', ['user@bad', 'otherUser']);
        deliveryRule.validate().then(({model, validations}) => {
          assert.notOk(validations.get('isValid'), 'deliveryRule is invalid');
          assert.equal(validations.get('messages').length,
            3,
            'Three Fields are invalid in the deliveryRule model');
          assert.notOk(model.get('validations.attrs.recipients.isValid'),
            'Recipients must have valid email addresses');
        });
      });
    });
  });
});

import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import config from 'ember-get-config';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

const HOST = config.navi.dataSources[0].uri;

const COMMON_TEMPLATE = hbs`
        {{dimension-bulk-import
           dimension=dimension
           queryIds=queryIds
           onSelectValues= (action onSelectValues)
           onCancel= (action onCancel)
        }}
    `,
  PROPERTY_MOCK_DATA = {
    rows: [
      {
        id: '114',
        propertyEventId: '7645365',
        description: 'Property 1'
      },
      {
        id: '100001',
        propertyEventId: '1197577085',
        description: 'Property 2'
      },
      {
        id: '100002',
        propertyEventId: '1197577086',
        description: 'Property 3'
      },
      {
        id: '100003',
        propertyEventId: '979436095',
        description: 'Property 4'
      }
    ]
  };

moduleForComponent('dimension-bulk-import', 'Integration | Component | Dimension Bulk Import', {
  integration: true,

  beforeEach: function() {
    setupMock().pretender.map(function() {
      this.get(`${HOST}/v1/dimensions/property/values/`, request => {
        if (request.queryParams.filters === 'property|id-in[100001,100002,56565565,78787,114,100003]') {
          return [200, { 'Content-Type': 'application/json' }, JSON.stringify(PROPERTY_MOCK_DATA)];
        }
      });

      this.get(`${HOST}/v1/dimensions/multiSystemId/values/`, request => {
        if (request.queryParams.filters === 'multiSystemId|id-in[6,7]') {
          return [
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              rows: [
                {
                  id: '6',
                  key: 'k6',
                  description: 'System ID 1'
                },
                {
                  id: '7',
                  key: 'k7',
                  description: 'System ID 2'
                }
              ]
            })
          ];
        }
      });
    });

    let dimension = {
      name: 'property',
      longName: 'Property'
    };

    this.setProperties({
      dimension,
      onSelectValues: () => {},
      onCancel: () => {},
      queryIds: ['100001', '100002', '56565565', '78787', '114', '100003']
    });

    return this.container.lookup('service:bard-metadata').loadMetadata();
  },

  afterEach: function() {
    teardownMock();
  }
});

test('bulk import Component renders', function(assert) {
  assert.expect(2);

  this.render(COMMON_TEMPLATE);

  assert.ok(this.$('.dimension-bulk-import').is(':visible'), 'Component renders');

  let buttons = $('.btn-container button');
  assert.deepEqual(
    buttons
      .map(function() {
        return this.textContent.trim();
      })
      .get(),
    ['Include Valid IDs', 'Cancel'],
    'Include and Cancel buttons are rendered in input mode as expected'
  );
});

test('search dimension IDs', function(assert) {
  assert.expect(6);

  this.render(COMMON_TEMPLATE);

  assert.equal($('.loading-message').length, 1, 'loading spinner is visible');

  return wait().then(() => {
    /* == Valid Ids == */
    assert.equal(
      $('.valid-id-count')
        .text()
        .trim(),
      '4',
      'Valid ID count is 4'
    );

    let validPills = $('.id-container:first .item');
    assert.deepEqual(
      validPills
        .map(function() {
          return this.childNodes[0].wholeText.trim();
        })
        .get(),
      ['Property 1 (114)', 'Property 2 (100001)', 'Property 3 (100002)', 'Property 4 (100003)'],
      'Search returns valid IDs as expected'
    );

    /* == Invalid Ids == */
    assert.equal(
      $('.invalid-id-count')
        .text()
        .trim(),
      '2',
      'Invalid ID count is 2'
    );

    let invalidPills = $('.paginated-scroll-list:last .item');
    assert.deepEqual(
      invalidPills
        .map(function() {
          return this.textContent.trim();
        })
        .get(),
      ['56565565', '78787'],
      'Search returns invalid IDs as expected'
    );

    let buttons = $('.btn-container button');
    assert.deepEqual(
      buttons
        .map(function() {
          return this.textContent.trim();
        })
        .get(),
      ['Include Valid IDs', 'Cancel'],
      'Search and Cancel buttons are rendered in result mode as expected'
    );
  });
});

test('onSelectValues action is triggered', function(assert) {
  assert.expect(2);

  this.set('onSelectValues', validDimVals => {
    assert.ok(true, 'onSelectValues action is triggered');

    assert.deepEqual(
      validDimVals.mapBy('id'),
      ['114', '100001', '100002', '100003'],
      'Only Valid dimension IDs are received'
    );
  });

  this.render(COMMON_TEMPLATE);

  return wait().then(() => {
    //Click Include Valid IDs Button
    this.$('.btn-container button:contains(Include Valid IDs)').click();
  });
});

test('onCancel action is triggered', function(assert) {
  assert.expect(1);

  this.set('onCancel', () => {
    assert.ok(true, 'onCancel action is triggered');
  });

  this.render(COMMON_TEMPLATE);

  return wait().then(() => {
    //Click Cancel Button
    $('.btn-container button:contains(Cancel)').click();
  });
});

test('remove valid IDs', function(assert) {
  assert.expect(6);

  this.render(COMMON_TEMPLATE);

  return wait().then(() => {
    assert.equal(
      $('.valid-id-count')
        .text()
        .trim(),
      '4',
      'Valid ID count is 4 before removing any pills'
    );

    let validPills = $('.id-container:first .item');
    assert.deepEqual(
      validPills
        .map(function() {
          return this.childNodes[0].wholeText.trim();
        })
        .get(),
      ['Property 1 (114)', 'Property 2 (100001)', 'Property 3 (100002)', 'Property 4 (100003)'],
      'Search returns 7 valid IDs as expected before removing any pills'
    );

    let invalidPills = $('.paginated-scroll-list:last .item');
    assert.deepEqual(
      invalidPills
        .map(function() {
          return this.textContent.trim();
        })
        .get(),
      ['56565565', '78787'],
      'Search returns 2 invalid IDs as expected before removing any pills'
    );

    //Remove First Valid Pill, item removed depends on the ordering
    run(() => {
      $('.items-list:first .item:first button').click();
    });

    assert.equal(
      $('.valid-id-count')
        .text()
        .trim(),
      '3',
      'Valid ID count is 3 after removing a pill'
    );

    validPills = $('.id-container:first .item');
    assert.deepEqual(
      validPills
        .map(function() {
          return this.childNodes[0].wholeText.trim();
        })
        .get(),
      ['Property 2 (100001)', 'Property 3 (100002)', 'Property 4 (100003)'],
      'Search returns 6 valid IDs as expected after removing a pill'
    );

    invalidPills = $('.paginated-scroll-list:last .item');
    assert.deepEqual(
      invalidPills
        .map(function() {
          return this.textContent.trim();
        })
        .get(),
      ['56565565', '78787'],
      'invalid IDs do not change after removing any pills'
    );
  });
});

test('behaviour of headers', function(assert) {
  assert.expect(3);

  this.render(COMMON_TEMPLATE);

  /* == Main header == */
  assert.equal(
    this.$('.primary-header')
      .text()
      .trim(),
    'Add Multiple Properties',
    'Main header contains plural form of the dimension name'
  );

  assert.equal(
    this.$('.secondary-header')
      .text()
      .trim(),
    'Hold tight! We are searching for valid Properties.',
    'Secondary header has expected searching text while searching'
  );

  return wait().then(() => {
    assert.equal(
      this.$('.secondary-header')
        .text()
        .trim(),
      'Search Results.',
      'Secondary header has expected result text after searching'
    );
  });
});

test('Search dimension with smart key', function(assert) {
  assert.expect(1);
  this.setProperties({
    dimension: { name: 'multiSystemId', longName: 'Multi System Id' },
    onSelectValues: () => {},
    onCancel: () => {},
    queryIds: ['6', '7']
  });

  this.render(COMMON_TEMPLATE);

  return wait().then(() => {
    let validPills = this.$('.id-container:first .item');
    assert.deepEqual(
      validPills
        .map(function() {
          return this.childNodes[0].wholeText.trim();
        })
        .get(),
      ['System ID 1 (6)', 'System ID 2 (7)'],
      'Search returns valid IDs as expected'
    );
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll, waitFor, click } from '@ember/test-helpers';
import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
import { setupMirage } from 'ember-cli-mirage/test-support';

const HOST = config.navi.dataSources[0].uri;

const COMMON_TEMPLATE = hbs`<DimensionBulkImport
    @rawQuery={{this.rawQuery}}
    @dimension={{this.dimension}}
    @queryIds={{this.queryIds}}
    @onSelectValues={{action this.onSelectValues}}
    @onCancel={{action this.onCancel}}
  />`,
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

module('Integration | Component | Dimension Bulk Import', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.server.get(
      `${HOST}/v1/dimensions/property/values/`,
      (schema, request) => {
        if (request.queryParams.filters === 'property|id-in["100001","100002","56565565","78787","114","100003"]') {
          return PROPERTY_MOCK_DATA;
        }
      },
      { timing: 400 }
    );

    this.server.get(
      `${HOST}/v1/dimensions/multiSystemId/values/`,
      (schema, request) => {
        if (request.queryParams.filters === 'multiSystemId|id-in["6","7"]') {
          return {
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
          };
        }
      },
      { timing: 400 }
    );

    let dimension = {
      id: 'property',
      name: 'Property'
    };

    this.setProperties({
      dimension,
      onSelectValues: () => {},
      onCancel: () => {},
      queryIds: ['100001', '100002', '56565565', '78787', '114', '100003']
    });

    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('bulk import Component renders', async function(assert) {
    assert.expect(3);

    const rawQuery = this.queryIds.join(',');
    this.set('rawQuery', rawQuery);
    await render(COMMON_TEMPLATE);

    assert.dom('.dimension-bulk-import').isVisible('Component renders');

    assert.deepEqual(
      findAll('.btn-container button').map(el => el.textContent.trim()),
      ['Include Valid IDs', 'Cancel'],
      'Include and Cancel buttons are rendered in input mode as expected'
    );

    await settled();
    assert.dom('.pasted-input').hasText(rawQuery, 'pasted text is visible');
  });

  test('search dimension IDs', async function(assert) {
    assert.expect(6);

    render(COMMON_TEMPLATE);

    await waitFor('.navi-loading-message');
    assert.dom('.navi-loading-message').isVisible('loading spinner is visible');

    await settled();
    /* == Valid Ids == */
    assert.dom('.valid-id-count').hasText('4', 'Valid ID count is 4');

    let validPills = $('.id-container:first .item');
    assert.deepEqual(
      validPills
        .map(function() {
          return this.childNodes[3].wholeText.trim();
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

  test('onSelectValues action is triggered', async function(assert) {
    assert.expect(2);

    this.set('onSelectValues', validDimVals => {
      assert.ok(true, 'onSelectValues action is triggered');

      assert.deepEqual(
        validDimVals.mapBy('id'),
        ['114', '100001', '100002', '100003'],
        'Only Valid dimension IDs are received'
      );
    });

    await render(COMMON_TEMPLATE);

    //Click Include Valid IDs Button
    await click($('.btn-container button:contains(Include Valid IDs)')[0]);
  });

  test('onCancel action is triggered', async function(assert) {
    assert.expect(1);

    this.set('onCancel', () => {
      assert.ok(true, 'onCancel action is triggered');
    });

    await render(COMMON_TEMPLATE);

    await settled();
    //Click Cancel Button
    await click($('.btn-container button:contains(Cancel)')[0]);
  });

  test('remove valid IDs', async function(assert) {
    assert.expect(6);

    await render(COMMON_TEMPLATE);

    await settled();

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
          return this.childNodes[3].wholeText.trim();
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
    await click('.items-list:first-of-type .item:first-of-type .remove-pill');

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
          return this.childNodes[3].wholeText.trim();
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

  test('behavior of headers', async function(assert) {
    assert.expect(3);

    render(COMMON_TEMPLATE);

    await waitFor('.primary-header');
    /* == Main header == */
    assert
      .dom('.primary-header')
      .hasText('Add Multiple Properties', 'Main header contains plural form of the dimension name');

    assert
      .dom('.secondary-header')
      .hasText(
        'Hold tight! We are searching for valid Properties.',
        'Secondary header has expected searching text while searching'
      );

    await settled();

    assert
      .dom('.secondary-header')
      .hasText('Search Results for', 'Secondary header has expected result text after searching');
  });

  test('Search dimension with smart key', async function(assert) {
    assert.expect(1);
    this.setProperties({
      dimension: { id: 'multiSystemId', name: 'Multi System Id' },
      onSelectValues: () => {},
      onCancel: () => {},
      queryIds: ['6', '7']
    });

    await render(COMMON_TEMPLATE);

    return settled().then(() => {
      let validPills = $('.id-container:first .item');
      assert.deepEqual(
        validPills
          .map(function() {
            return this.childNodes[3].wholeText.trim();
          })
          .get(),
        ['System ID 1 (6)', 'System ID 2 (7)'],
        'Search returns valid IDs as expected'
      );
    });
  });

  test('Raw input is searched', async function(assert) {
    assert.expect(1);
    const rawQuery = 'yes, comma';
    this.setProperties({
      dimension: { id: 'commaDim', name: 'Dimension With Comma' },
      onSelectValues: () => {},
      onCancel: () => {},
      rawQuery,
      queryIds: rawQuery.split(',').map(s => s.trim())
    });

    await render(COMMON_TEMPLATE);

    await settled();
    assert.deepEqual(
      findAll('.btn-container button').map(el => el.textContent.trim()),
      ['Include Valid IDs', 'Include Raw Input', 'Cancel'],
      'The Include Raw Input button shows up for valid rawQuery'
    );
  });
});

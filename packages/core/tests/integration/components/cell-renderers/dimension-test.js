import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
  {{cell-renderers/dimension
    data=data
    column=column
    request=request
  }}`;

const data = {
  dateTime: '2016-05-30 00:00:00.000',
  'os|id': 'BlackBerry',
  'os|desc': 'BlackBerry OS',
  uniqueIdentifier: 172933788,
  totalPageViews: 3669828357
};

const column = {
  attributes: { name: 'os' },
  type: 'dimension',
  displayName: 'Operating System'
};

const request = {
  dimensions: [{ dimension: 'os' }],
  metrics: [{ metric: 'uniqueIdentifier' }, { metric: 'totalPageViews' }],
  logicalTable: {
    table: 'network',
    timeGrain: 'day'
  }
};

module('Integration | Component | cell renderers/dimension', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('data', data);
    this.set('column', column);
    this.set('request', request);
  });

  test('dimension renders description value correctly', async function(assert) {
    assert.expect(3);
    await render(TEMPLATE);

    assert.ok($('.table-cell-content').is(':visible'), 'The dimension cell renderer is visible');

    assert.equal(
      $('.table-cell-content')
        .text()
        .trim(),
      'BlackBerry OS',
      'The dimension cell renders correctly when present description field is present'
    );

    assert.equal(
      $('.table-cell-content span').attr('title'),
      'BlackBerry OS (BlackBerry)',
      'The dimension cell title renders correctly when present description and id field is present'
    );
  });

  test('dimension renders id value when description is empty', async function(assert) {
    assert.expect(2);
    let data2 = {
      dateTime: '2016-05-30 00:00:00.000',
      'os|id': 'BlackBerry',
      'os|desc': '',
      uniqueIdentifier: 172933788,
      totalPageViews: 3669828357
    };

    this.set('data', data2);
    await render(TEMPLATE);

    assert.equal(
      $('.table-cell-content')
        .text()
        .trim(),
      'BlackBerry',
      'The dimension cell renders id correctly when description empty'
    );

    assert.equal(
      $('.table-cell-content span').attr('title'),
      'BlackBerry',
      'The dimension cell renders id correctly in title when description empty'
    );
  });

  test('dimension renders desc value when id is empty', async function(assert) {
    assert.expect(2);
    let data2 = {
      dateTime: '2016-05-30 00:00:00.000',
      'os|desc': 'BlackBerry OS',
      uniqueIdentifier: 172933788,
      totalPageViews: 3669828357
    };

    this.set('data', data2);
    await render(TEMPLATE);

    assert.equal(
      $('.table-cell-content')
        .text()
        .trim(),
      'BlackBerry OS',
      'The dimension cell renders desc correctly when id empty'
    );

    assert.equal(
      $('.table-cell-content span').attr('title'),
      'BlackBerry OS',
      'The dimension cell renders desc correctly in title when id empty'
    );
  });

  test('dimension renders no value with dashes correctly', async function(assert) {
    assert.expect(2);

    this.set('data', {});

    await render(hbs`
      {{cell-renderers/dimension
        data=data
        column=column
        request=request
      }}
    `);

    assert.equal(
      $('.table-cell-content')
        .text()
        .trim(),
      '--',
      'The dimension cell renders correctly when present description field is not present'
    );

    assert.equal(
      $('.table-cell-content span').attr('title'),
      '',
      'The dimension cell renders title correctly when present description field is not present'
    );
  });
});

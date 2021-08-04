import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
  {{navi-cell-renderers/dimension
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

    assert.dom('.table-cell-content').isVisible('The dimension cell renderer is visible');

    assert
      .dom('.table-cell-content')
      .hasText('BlackBerry OS', 'The dimension cell renders correctly when present description field is present');

    assert
      .dom('.table-cell-content span')
      .hasAttribute(
        'title',
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

    assert
      .dom('.table-cell-content')
      .hasText('BlackBerry', 'The dimension cell renders id correctly when description empty');

    assert
      .dom('.table-cell-content span')
      .hasAttribute('title', 'BlackBerry', 'The dimension cell renders id correctly in title when description empty');
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

    assert
      .dom('.table-cell-content')
      .hasText('BlackBerry OS', 'The dimension cell renders desc correctly when id empty');

    assert
      .dom('.table-cell-content span')
      .hasAttribute('title', 'BlackBerry OS', 'The dimension cell renders desc correctly in title when id empty');
  });

  test('dimension renders no value with dashes correctly', async function(assert) {
    assert.expect(2);

    this.set('data', {});

    await render(hbs`
      {{navi-cell-renderers/dimension
        data=data
        column=column
        request=request
      }}
    `);

    assert
      .dom('.table-cell-content')
      .hasText('--', 'The dimension cell renders correctly when present description field is not present');

    assert
      .dom('.table-cell-content span')
      .hasAttribute(
        'title',
        '',
        'The dimension cell renders title correctly when present description field is not present'
      );
  });

  test('dimension rollup render', async function(assert) {
    assert.expect(2);
    this.set('data', { ...this.data, 'os|id': null, 'os|desc': null });
    this.rollup = true;

    await render(hbs`
      <NaviCellRenderers::Dimension
        @data={{this.data}}
        @column={{this.column}}
        @request={{this.request}}
        @isRollup={{this.rollup}}
      />
    `);

    assert.dom('.table-cell-content').hasText('\xa0', 'renders non breaking space when rollup is true');

    this.set('rollup', false);

    assert.dom('.table-cell-content').hasText('--', 'renders dash when rollup is false');
  });
});

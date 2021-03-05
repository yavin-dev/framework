import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
  <CommonActions::GetApi
    @request={{this.TestRequest}}
    class="a-custom-class"
  >
    Get API
  </CommonActions::GetApi>
`;
let Store;

module('Integration | Component | common actions/get api', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    Store = this.owner.lookup('service:store');
    this.TestRequestElide = Store.createFragment('bard-request-v2/request', {
      table: 'tableA',
      columns: [
        { field: 'datestamp', parameters: {}, type: 'timeDimension' },
        { field: 'userCount', parameters: {}, type: 'metric' },
      ],
      filters: [],
      sorts: [],
      requestVersion: '2.0',
      dataSource: 'elideOne',
    });

    this.TestRequestBard = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['current', 'next'],
          source: 'bardOne',
        },
      ],
      columns: [{ type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'day' }, source: 'bardOne' }],
      sorts: [],
      requestVersion: '2.0',
      dataSource: 'bardOne',
    });
  });

  test('Component renders', async function (assert) {
    this.set('TestRequest', this.TestRequestBard);
    await render(TEMPLATE);
    assert.dom('.get-api__action-btn').hasText('Get API', 'Component yields given text');
  });

  test('Custom button classes', async function (assert) {
    this.TestRequest = this.TestRequestBard;
    await render(TEMPLATE);
    assert
      .dom('.get-api__action-btn')
      .hasClass('a-custom-class', 'Class names for the button element can be configured');
  });

  test('Modal Bard', async function (assert) {
    this.set('TestRequest', this.TestRequestBard);
    await render(TEMPLATE);

    assert.dom('.get-api__modal').doesNotExist('Copy modal does not exist before clicking the component');

    await click('.get-api__action-btn');
    assert.dom('.get-api__modal').exists('Copy modal dialog pops up on clicking the component');

    assert
      .dom('.get-api__api-input')
      .hasValue(
        'https://data.naviapp.io/v1/data/network/day/?dateTime=current%2Fnext&metrics=&format=json',
        'Modal input box has link to the current page'
      );

    assert.deepEqual(
      findAll('.button').map((el) => el.textContent.trim()),
      ['Copy Link', 'Run API Query', 'Cancel'],
      'Copy, New Tab, and Cancel buttons are rendered'
    );
  });

  test('Modal Elide', async function (assert) {
    this.set('TestRequest', this.TestRequestElide);
    await render(TEMPLATE);

    assert.dom('.get-api__modal').doesNotExist('Copy modal does not exist before clicking the component');

    await click('.get-api__action-btn');

    assert.dom('.get-api__modal').exists('Copy modal dialog pops up on clicking the component');

    assert
      .dom('.get-api__api-input')
      .hasValue(
        '{"query":"{ tableA { edges { node { col0:datestamp col1:userCount } } } }"}',
        'Modal input box has link to the current page'
      );

    assert.deepEqual(
      findAll('.button').map((el) => el.textContent.trim()),
      ['Copy Link', 'Cancel'],
      'Copy, New Tab, and Cancel buttons are rendered'
    );
  });

  test('Cancel button', async function (assert) {
    this.set('TestRequest', this.TestRequestBard);
    await render(TEMPLATE);

    assert.dom('.get-api__modal').doesNotExist('Copy modal does not exist before clicking the component');

    // Click component
    await click('.get-api__action-btn');

    assert.dom('.get-api__modal').exists('Copy modal dialog pops up on clicking the component');

    // Click Cancel
    await click('.get-api__cancel-btn');

    assert.dom('.get-api__modal').doesNotExist('Copy modal does not exist after clicking cancel button');
  });
});

import merge from 'lodash/merge';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
  {{navi-cell-renderers/total
    data=data
    column=column
    request=request
  }}`;

const data = {
  dateTime: 'Header',
  'os|id': 'All Other',
  'os|desc': 'All Other',
  uniqueIdentifier: 172933788,
  totalPageViews: 3669828357
};

const column = {
  field: { dateTime: 'dateTime' },
  type: 'dateTime',
  displayName: 'Date'
};

module('Integration | Component | cell renderers/total', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.set('data', data);
    this.set('column', column);
    await render(TEMPLATE);
  });

  test('it renders', function(assert) {
    assert.expect(5);

    assert.dom('.table-cell--total').isVisible('the total cell is rendered');

    assert.dom('.table-cell--total').hasText('Header', 'the total cell displays the correct field from the data');

    assert.dom('.table-cell__info-message').isNotVisible('the info message and icon are not visible');

    this.set(
      'data',
      merge({}, data, {
        __meta__: {
          hasPartialData: true
        }
      })
    );

    assert.dom('.table-cell__info-message').isVisible('the info message is visible when the partial data flag is true');

    assert
      .dom('.table-cell__info-message--icon')
      .isVisible('the info message icon is visible when the partial data flag is true');
  });
});

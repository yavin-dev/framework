import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import { getDateRangeFormat } from './date-range-test';

module('Integration | Component | filter values/current period', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: arr([Interval.parseFromStrings('current', 'next')]) };
    this.request = { logicalTable: { timeGrain: 'day' } };

    await render(hbs`<FilterValues::CurrentPeriod
            @filter={{this.filter}}
            @request={{this.request}}
            @isCollapsed={{this.isCollapsed}}
        />`);
  });

  test('it renders', function(assert) {
    assert.expect(2);

    assert
      .dom('.filter-values--current-period')
      .hasText(`The current day. (${getDateRangeFormat(this)})`, 'The current period is day');

    this.set('request', { logicalTable: { timeGrain: 'week' } });
    assert
      .dom('.filter-values--current-period')
      .hasText(`The current week. (${getDateRangeFormat(this)})`, 'The current period changes to week');
  });

  test('collapsed', async function(assert) {
    assert.expect(2);

    this.set('isCollapsed', true);

    assert
      .dom('.filter-values--current-period')
      .doesNotExist('The current period label does not display when collapsed');
    assert.dom().hasText(`${getDateRangeFormat(this)}`, 'The current period is rendered correctly when collapsed');
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { A as arr } from '@ember/array';
import { run } from '@ember/runloop';

module('Integration | Component | filter values/date', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: [] };
    this.request = { logicalTable: { timeGrain: { name: 'day' } } };
    this.onUpdateFilter = () => null;
    this.selectedDate = null;

    await render(hbs`
      {{filter-values/date
        filter=filter
        request=request
        onUpdateFilter=(action onUpdateFilter)
        _selectedDate=selectedDate
        isCollapsed=isCollapsed
      }}`);
  });

  test('Displayed text', async function(assert) {
    assert.expect(2);

    assert
      .dom('.filter-values--date')
      .hasText('Select date', 'The placeholder text is displayed when no date is selected');

    await run(() => {
      this.set('filter', { values: arr(['2018-10-31']) });
    });

    assert.dom('.filter-values--date').hasText('Oct 31, 2018', 'The selected date is displayed');
  });

  test('collapsed', async function(assert) {
    assert.expect(2);

    this.set('filter', { values: arr(['2018-10-31']) });
    this.set('isCollapsed', true);

    assert.dom().hasText('Oct 31, 2018', 'Selected date is rendered correctly');

    this.set('filter', { values: arr(['']) });

    assert.dom('.filter-values--date .filter-values--selected-error').exists('Error is rendered when date is invalid');
  });
});

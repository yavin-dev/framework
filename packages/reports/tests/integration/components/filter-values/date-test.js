import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
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
      }}`);
  });

  test('Displayed text', function(assert) {
    assert.expect(2);

    assert.dom('*').hasText('Select date', 'The placeholder text is displayed when no date is selected');

    run(() => {
      this.set('filter', { values: arr(['2018-10-31']) });
    });

    assert.dom('*').hasText('Oct 31, 2018', 'The selected date is displayed');
  });
});

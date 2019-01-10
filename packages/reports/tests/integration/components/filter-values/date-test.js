import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { A as arr } from '@ember/array';
import { run } from '@ember/runloop';

moduleForComponent('filter-values/date', 'Integration | Component | filter values/date', {
  integration: true,

  beforeEach: function() {
    this.filter = { values: [] };
    this.request = { logicalTable: { timeGrain: { name: 'day' } } };
    this.onUpdateFilter = () => null;
    this.selectedDate = null;

    this.render(hbs`
      {{filter-values/date
        filter=filter
        request=request
        onUpdateFilter=(action onUpdateFilter)
        _selectedDate=selectedDate
      }}`);
  }
});

test('Displayed text', function(assert) {
  assert.expect(2);

  assert.equal(
    this.$()
      .text()
      .trim(),
    'Select date',
    'The placeholder text is displayed when no date is selected'
  );

  run(() => {
    this.set('filter', { values: arr(['2018-10-31']) });
  });

  assert.equal(
    this.$()
      .text()
      .trim(),
    'Oct 31, 2018',
    'The selected date is displayed'
  );
});

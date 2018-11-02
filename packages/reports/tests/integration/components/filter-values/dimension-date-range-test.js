import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'filter-values/dimension-date-range',
  'Integration | Component | filter values/dimension date range',
  {
    integration: true,

    beforeEach: function() {
      this.filter = { values: [] };
      this.request = { logicalTable: { timeGrain: { name: 'day' } } };
      this.onUpdateFilter = () => null;

      this.render(hbs`{{filter-values/dimension-date-range
            filter=filter
            request=request
            onUpdateFilter=(action onUpdateFilter)
        }}`);
    }
  }
);

test('changing values', function(assert) {
  assert.expect(1);

  this.set('onUpdateFilter', changeSet => {
    let expectedInterval = 'P7D/current';
    assert.equal(
      changeSet.values[0],
      expectedInterval,
      'Selected interval is given to update action through the values property'
    );
  });

  this.$('.predefined-range:contains(Last 7 Days)').click();
});

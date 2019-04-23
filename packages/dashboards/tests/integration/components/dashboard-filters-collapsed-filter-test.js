import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'dashboard-filters-collapsed-filter',
  'Integration | Component | dashboard filters collapsed filter',
  {
    integration: true
  }
);

test('it renders', function(assert) {
  this.filter = {
    dimension: {
      name: 'property',
      longName: 'Proptery'
    },
    operator: 'in',
    field: 'id',
    rawValues: ['1', '2']
  };

  this.render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'Proptery equals 1, 2',
    'Has expected text'
  );
});

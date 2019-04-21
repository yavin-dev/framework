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
  this.render(hbs`{{dashboard-filters-collapsed-filter}}`);

  assert.equal(
    this.$()
      .text()
      .trim(),
    ''
  );
});

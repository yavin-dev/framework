import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dashboard-filters-collapsed', 'Integration | Component | dashboard filters collapsed', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{dashboard-filters-collapsed}}`);

  assert.equal(
    this.$()
      .text()
      .trim(),
    ''
  );
});

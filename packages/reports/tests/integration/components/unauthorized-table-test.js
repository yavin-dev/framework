import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('unauthorized-table', 'Integration | Component | unauthorized table', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  const model = {
    request: {
      logicalTable: {
        table: {
          longName: 'Protected Table'
        }
      }
    }
  };

  this.set('model', model);

  this.render(hbs`
    {{unauthorized-table report=model}}
  `);

  assert.ok(this.$('.fa-lock').is(':visible'), 'Lock icon is visible');

  assert.ok(
    this.$()
      .text()
      .includes('Protected Table'),
    "Displays table name they don't have access to"
  );
});

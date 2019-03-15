import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | unauthorized table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
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

    await render(hbs`
      {{unauthorized-table report=model}}
    `);

    assert.ok(this.$('.fa-lock').is(':visible'), 'Lock icon is visible');

    assert.ok(find('*').textContent.includes('Protected Table'), "Displays table name they don't have access to");
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | unauthorized table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(2);

    const model = {
      request: {
        logicalTable: {
          table: {
            name: 'Protected Table'
          }
        }
      }
    };

    this.set('model', model);

    await render(hbs`
      {{unauthorized-table report=model}}
    `);

    assert.dom('.fa-lock').isVisible('Lock icon is visible');

    assert
      .dom('.navi-report-invalid__unauthorized')
      .includesText('Protected Table', "Displays table name they don't have access to");
  });
});

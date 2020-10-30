import { visit, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | print views', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Viewing /print/reports', async function(assert) {
    assert.expect(2);

    await visit('/print/reports/1/view');

    assert.dom('.navi-report__title').hasText('Kart Wins By Character', 'The report title shows up');
    assert.deepEqual(
      findAll('.line-chart-widget .c3-legend-item').map(el => el.textContent),
      ['Dry Bowser', 'Daisy', 'Wario', '0', '1', '2', '3', '5', '6', '9'],
      'The legend fills in with widget dimensions'
    );
  });

  test('Viewing /print/dashboards', async function(assert) {
    assert.expect(3);

    await visit('/print/dashboards/1/view');

    assert.dom('.navi-widget__title').hasText('Kart Wins By Character', 'The widget title shows up');
    assert.dom('.c3-axis-y-label').hasText('Wins', 'The widget y-axis title shows up');
    assert.deepEqual(
      findAll('.line-chart-widget .c3-legend-item').map(el => el.textContent.trim()),
      ['Dry Bowser', 'Daisy', 'Wario'],
      'Dashboard widget legend should fill in with dimensions'
    );
  });
});

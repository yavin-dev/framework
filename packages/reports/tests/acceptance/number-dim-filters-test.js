import { click, visit, fillIn, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickItemFilter } from 'navi-reports/test-support/report-builder';
import { selectChoose } from 'ember-power-select/test-support';

module('Acceptance | number dim filters', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('number dimension filter', async function(assert) {
    await visit('/reports/1/view');
    await clickItemFilter('dimension', 'Budget');

    assert.dom('.filter-collection__row:nth-child(2) .filter-builder__operator').hasText('Equals (=)');

    await fillIn('.filter-values--value-input', '123');

    let apiUrl = await getApiQuery();

    assert.equal(
      apiUrl.searchParams.get('filters'),
      'Budget|id-eq["123"]',
      'filter builder builds correct eq filter for number dimension'
    );

    apiUrl = await switchOperator(0, '321');
    assert.equal(
      apiUrl.searchParams.get('filters'),
      'Budget|id-gt["321"]',
      'filter builder builds correct gt filter for number dimension'
    );

    apiUrl = await switchOperator(1, '231');
    assert.equal(
      apiUrl.searchParams.get('filters'),
      'Budget|id-gte["231"]',
      'filter builder builds correct gte filter for number dimension'
    );

    apiUrl = await switchOperator(2, '123');
    assert.equal(
      apiUrl.searchParams.get('filters'),
      'Budget|id-lt["123"]',
      'filter builder builds correct lt filter for number dimension'
    );

    apiUrl = await switchOperator(3, '321');
    assert.equal(
      apiUrl.searchParams.get('filters'),
      'Budget|id-lte["321"]',
      'filter builder builds correct lte filter for number dimension'
    );

    apiUrl = await switchOperator(5, '231');
    assert.equal(
      apiUrl.searchParams.get('filters'),
      'Budget|id-neq["231"]',
      'filter builder builds correct neq filter for number dimension'
    );

    apiUrl = await switchOperator(6, '123', '321');
    assert.equal(
      apiUrl.searchParams.get('filters'),
      'Budget|id-bet["123","321"]',
      'filter builder builds correct bet filter for number dimension'
    );

    apiUrl = await switchOperator(7, '321', '123');
    assert.equal(
      apiUrl.searchParams.get('filters'),
      'Budget|id-nbet["321","123"]',
      'filter builder builds correct nbet filter for number dimension'
    );
  });
});

async function getApiQuery() {
  await click('.get-api__btn');
  const url = find('.navi-modal__input').value;
  await click('.navi-modal__close');
  return new URL(url);
}

async function switchOperator(pos, input, highInput) {
  await selectChoose(
    '.filter-collection__row:nth-child(2) .filter-builder__select-trigger',
    '.ember-power-select-option',
    pos
  );
  if (highInput) {
    await fillIn('.filter-values--range-input input:first-child', input);
    await fillIn('.filter-values--range-input input:last-child', highInput);
  } else {
    await fillIn('.filter-values--value-input', input);
  }
  return getApiQuery();
}
